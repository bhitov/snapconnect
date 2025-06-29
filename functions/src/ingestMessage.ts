/******************************************************************
 * FIRESTORE TRIGGER  v2 • firebase-admin v13.4.0 · Pinecone Node‑SDK v6.x
 * Runs when a **textMessages/{messageId}** doc is created, embeds &
 * classifies the text, stores the vector in Pinecone, and writes the
 * sentiment/horseman back to Firestore.
 *****************************************************************/

import { onValueCreated } from 'firebase-functions/v2/database';
import { openai, generateEmbedding } from './openai';
import { index } from './pinecone';

/** ----------------------------------------------------------------
 *  Runtime & app bootstrap
 *  ---------------------------------------------------------------- */

// External services — keep your keys in env/config

/** ----------------------------------------------------------------
 *  Models & prompt
 *  ---------------------------------------------------------------- */
const CLS_SYS = `
Return a JSON object with:
  "sentiment": "pos|neu|neg"
  "horseman" : "criticism|contempt|defensiveness|none"
Examples:
"You never help me"        → {"sentiment":"neg","horseman":"criticism"}
"Whatever 🙄"              → {"sentiment":"neg","horseman":"contempt"}
"Well if YOU had..."       → {"sentiment":"neg","horseman":"defensiveness"}
"Sounds great, thanks ❤️"  → {"sentiment":"pos","horseman":"none"}
`.trim();

/** ----------------------------------------------------------------
 *  Helpers
 *  ---------------------------------------------------------------- */

async function classify(
  text: string
): Promise<{ sentiment: string; horseman: string }> {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    temperature: 0,
    messages: [
      { role: 'system', content: CLS_SYS },
      { role: 'user', content: text },
    ],
  });

  const raw = res.choices[0]?.message?.content ?? '{}';
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('[CLASSIFY] JSON parse error', err, raw);
    return { sentiment: 'neu', horseman: 'none' };
  }
}

/** ----------------------------------------------------------------
 *  Firestore v2 trigger
 *  ---------------------------------------------------------------- */
// export const onTextMessageCreated = 1;
// export const onTextMessageCreated = onDocumentCreated(
//   "textMessages/{messageId}",
//   async (event) => {
//     console.log('IM IN THE THING THING THING THING');
//     const snap = event.data; // DocumentSnapshot | undefined
//     if (!snap?.exists) return;
//
//     const data = snap.data() as any;
//     const text = data?.text;
//     if (!text) return;
//
//     // Do work in parallel where possible
//     const [vector, label] = await Promise.all([generateEmbedding(text), classify(text)]);
//
//     // Upsert vector + metadata to Pinecone
//     await index.upsert([
//       {
//         id: event.params.messageId,
//         values: vector,
//         metadata: {
//           conversationId: data.conversationId,
//           senderId: data.senderId,
//           createdAt: data.createdAt ?? Date.now(),
//           text,
//           sentiment: label.sentiment,
//           horseman: label.horseman
//         }
//       }
//     ]);
//
//     console.log(`✅ ${event.params.messageId}: ${label.sentiment}/${label.horseman}`);
//   }
// );

/** ----------------------------------------------------------------
 *  Realtime Database (Row) Trigger
 *  ---------------------------------------------------------------- */
export const onTextMessageCreatedRTDB = onValueCreated(
  '/textMessages/{messageId}',
  async event => {
    const snap = event.data; // DataSnapshot
    if (!snap.exists()) return;

    const data = snap.val() as any;
    const text = data?.text;
    if (!text) return;

    // const label = await classify(text);
    const [vector, label] = await Promise.all([
      generateEmbedding(text),
      classify(text),
    ]);

    // Upsert vector + metadata to Pinecone
    await index.upsert([
      {
        id: event.params.messageId,
        values: vector,
        metadata: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          createdAt: data.createdAt ?? Date.now(),
          text,
          sentiment: label.sentiment,
          horseman: label.horseman,
        },
      },
    ]);

    //       await snap.ref.update({
    //         sentiment: label.sentiment,
    //         horseman: label.horseman,
    //         vectorStatus: "upserted"
    //       });

    console.log(
      `✅ [RTDB] ${event.params.messageId}: ${label.sentiment}/${label.horseman}`
    );
  }
);
