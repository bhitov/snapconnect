import { Pinecone } from "@pinecone-database/pinecone";
import { config } from './config';
import { index } from "./pinecone";

(async () => {
  const stats = await index.describeIndexStats();
  console.log(stats.totalRecordCount, "vectors already there");
})();