// Simple file-based storage for sharing user data between tests
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface StoredUser {
  email: string;
  password: string;
  username: string;
  uid?: string;
}

const STORAGE_FILE = join(process.cwd(), 'test-results', 'test-users.json');

export function storeUser(key: string, user: StoredUser): void {
  let data: Record<string, StoredUser> = {};
  
  if (existsSync(STORAGE_FILE)) {
    try {
      data = JSON.parse(readFileSync(STORAGE_FILE, 'utf-8'));
    } catch {
      data = {};
    }
  }
  
  data[key] = user;
  writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Stored user ${key}: ${user.username}`);
}

export function getStoredUser(key: string): StoredUser | null {
  if (!existsSync(STORAGE_FILE)) {
    return null;
  }
  
  try {
    const data = JSON.parse(readFileSync(STORAGE_FILE, 'utf-8'));
    return data[key] || null;
  } catch {
    return null;
  }
}

export function clearStoredUsers(): void {
  if (existsSync(STORAGE_FILE)) {
    writeFileSync(STORAGE_FILE, '{}');
  }
  console.log('🧹 Cleared stored users');
}