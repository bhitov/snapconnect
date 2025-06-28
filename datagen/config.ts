/**
 * Centralized configuration for datagen scripts
 * Loads environment variables from datagen/.env.local
 */

import * as path from 'path';

import * as dotenv from 'dotenv';

// Load environment variables from datagen/.env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

interface Config {
  OPENAI_API_KEY: string;
  PINECONE_API_KEY: string;
  PINECONE_ENV: string;
  PINECONE_INDEX: string;
}

export const config: Config = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
  PINECONE_ENV: process.env.PINECONE_ENV || '',
  PINECONE_INDEX: process.env.PINECONE_INDEX || '',
};

// Validate required environment variables
const requiredVars = [
  'OPENAI_API_KEY',
  'PINECONE_API_KEY',
  'PINECONE_ENV',
  'PINECONE_INDEX',
];
const missingVars = requiredVars.filter(key => !config[key as keyof Config]);

if (missingVars.length > 0) {
  console.warn(
    `⚠️  Missing environment variables in datagen/.env.local: ${missingVars.join(', ')}`
  );
}
