// pinecone.ts ---------------------------------------------------------------
import { Pinecone } from '@pinecone-database/pinecone';
import { config } from './config';

export const pc = new Pinecone({ apiKey: config.PINECONE_API_KEY });

export const index = pc.index(
  config.PINECONE_INDEX,               // "messages"
  // { environment: config.PINECONE_ENV } // e.g. "us-east-1"
);