/******************************************************************
 * BACK-FILL  •  firebase-admin v13.4.0 · Pinecone Node-SDK v6.x
 *****************************************************************/
import { initializeApp, cert }           from "firebase-admin/app";
import { getDatabase }                   from "firebase-admin/database";
import { Pinecone }                      from "@pinecone-database/pinecone";
import OpenAI                            from "openai";
import { randomUUID }                    from "crypto";
import { db } from "./admin";
import { config } from "./config";
import { index } from "./pinecone";

// ---------- 0·  BOOTSTRAP --------------------------------------------------
const rtdb  = db

const openai     = new OpenAI({ apiKey: config.OPENAI_API_KEY });
const EMB_MODEL  = "text-embedding-3-small";
const EMB_DIM    = 1536;
const EMB_BATCH  = 2048;           // hard API cap :contentReference[oaicite:1]{index=1}
const CLS_BATCH  = 10;             // 10 msgs share one prompt → cheap
const UPSERT_BATCH = 200;          // Pinecone upsert batch limit

// ---------- 1·  CLASSIFIER PROMPT (concise) -------------------------------
const CLS_SYS = `
Return JSON array where each element has:
  "sentiment": "pos|neu|neg"
  "horseman" : "criticism|contempt|defensiveness|none"
Examples:
"You never help me"        → {"sentiment":"neg","horseman":"criticism"}
"Whatever 🙄"              → {"sentiment":"neg","horseman":"contempt"}
"Well if YOU had..."       → {"sentiment":"neg","horseman":"defensiveness"}
"Sounds great, thanks ❤️"  → {"sentiment":"pos","horseman":"none"}
`.trim();  // ~50 tokens, shared across 10 msgs

// ---------- 2·  HELPERS ----------------------------------------------------
async function embed(texts: string[]): Promise<number[][]> {
  const res = await openai.embeddings.create({ model: EMB_MODEL, input: texts });
  return res.data.map(d => d.embedding);
}

async function classify(batch: string[]): Promise<{sentiment:string;horseman:string}[]> {
  console.log(`🏷️  [CLASSIFY] Processing batch of ${batch.length} messages`);
  console.log(`🏷️  [CLASSIFY] Messages:`, batch.map((t, i) => `${i+1}. "${t.slice(0, 50)}${t.length > 50 ? '...' : ''}"`))
  
  const prompt = `Label these messages in order:\n${batch.map((t,i)=>`${i+1}. ${t}`).join("\n")}`;
  
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0,
      messages: [
        { role: "system", content: CLS_SYS },
        { role: "user",   content: prompt }
      ]
    });
    
    const rawContent = res.choices[0]?.message?.content || '[]';
    console.log(`🏷️  [CLASSIFY] Raw OpenAI response:`, rawContent);
    
    const parsed = JSON.parse(rawContent);
    console.log(`🏷️  [CLASSIFY] Parsed response:`, parsed);
    console.log(`🏷️  [CLASSIFY] Parsed type:`, typeof parsed, Array.isArray(parsed) ? 'Array' : 'Object');
    
    // Handle different response formats
    let result: {sentiment:string;horseman:string}[];
    if (Array.isArray(parsed)) {
      result = parsed;
    } else if (parsed.labels && Array.isArray(parsed.labels)) {
      result = parsed.labels;
    } else if (parsed.results && Array.isArray(parsed.results)) {
      result = parsed.results;
    } else {
      console.log(`🏷️  [CLASSIFY] Unexpected format, converting object to array`);
      result = Object.values(parsed) as {sentiment:string;horseman:string}[];
    }
    
    console.log(`🏷️  [CLASSIFY] Final result:`, result);
    console.log(`🏷️  [CLASSIFY] Result length:`, result.length, 'Expected:', batch.length);
    
    return result;
    
  } catch (error) {
    console.error(`🏷️  [CLASSIFY] Error:`, error);
    // Return fallback labels
    const fallback = batch.map(() => ({ sentiment: 'neu', horseman: 'none' }));
    console.log(`🏷️  [CLASSIFY] Using fallback:`, fallback);
    return fallback;
  }
}

// ---------- 3·  MAIN -------------------------------------------------------
(async () => {
  const convSnap = await rtdb.ref("conversations").get();
  if (!convSnap.exists()) return console.log("No conversations.");

  for (const [cid] of Object.entries(convSnap.val() as Record<string, unknown>)) {
    console.log(`\n📞 Processing conversation: ${cid}`);
    
    const msgSnap = await rtdb
      .ref("textMessages").orderByChild("conversationId").equalTo(cid).get();
    if (!msgSnap.exists()) {
      console.log(`📞 No messages found for conversation: ${cid}`);
      continue;
    }

    const rows = Object.entries(msgSnap.val() as Record<string, any>);
    const texts = rows.map(([,m]) => m.text);
    console.log(`📞 Found ${texts.length} messages in conversation ${cid}`);

    /* ---- 3·A  EMBEDDINGS  (batches ≤ 2 048) ---- */
    const vectors: number[][] = [];
    for (let i = 0; i < texts.length; i += EMB_BATCH) {
      const batchEmbeddings = await embed(texts.slice(i, i+EMB_BATCH));
      vectors.push(...batchEmbeddings);
    }

    /* ---- 3·B  CLASSIFY (micro-batched 10) ---- */
    console.log(`🏷️  Starting classification for ${texts.length} messages`);
    const labels: {sentiment:string;horseman:string}[] = [];
    for (let i=0;i<texts.length;i+=CLS_BATCH) {
      const batch = texts.slice(i,i+CLS_BATCH);
      console.log(`🏷️  Processing batch ${Math.floor(i/CLS_BATCH) + 1} (messages ${i+1}-${Math.min(i+CLS_BATCH, texts.length)})`);
      const batchLabels = await classify(batch);
      console.log(`🏷️  Got ${batchLabels.length} labels from batch, total labels so far: ${labels.length + batchLabels.length}`);
      labels.push(...batchLabels);
    }
    console.log(`🏷️  Classification complete. Total labels: ${labels.length}`);

    /* ---- 3·C  UPSERT  ---- */
    const upserts = rows.map(([mid,m],i)=>({
      id: mid,
      values: vectors[i] || [],
      metadata: {
        conversationId: cid,
        senderId      : m.senderId,
        createdAt     : m.createdAt,
        text          : m.text,
        sentiment     : labels[i]?.sentiment || 'neu',
        horseman      : labels[i]?.horseman || 'none'
      }
    }));
    
    console.log(`📌 Upserting ${upserts.length} vectors in batches of ${UPSERT_BATCH}`);
    for (let i = 0; i < upserts.length; i += UPSERT_BATCH) {
      const batch = upserts.slice(i, i + UPSERT_BATCH);
      console.log(`📌 Upserting batch ${Math.floor(i/UPSERT_BATCH) + 1} (${batch.length} vectors)`);
      await index.upsert(batch);
    }
    console.log(`✅  ${cid}: ${upserts.length} messages upserted`);
  }
  console.log("🏁  Back-fill complete.");
})();