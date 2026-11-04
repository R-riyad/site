import fs from 'fs';
import path from 'path';
import { StoreData } from '@/types';
import defaultData from '@/data/products.json';
export { formatPrice } from './format';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'products.json');
const REDIS_KEY = 'vitrin_store_data';

// In-memory cache
let inMemoryStore: StoreData = defaultData as StoreData;

// Safely unwrap data that might be double-stringified or plain object
export function parseStoreData(val: any): StoreData | null {
  if (!val) return null;
  let result = val;
  while (typeof result === 'string') {
    try {
      result = JSON.parse(result);
    } catch {
      break;
    }
  }
  if (result && typeof result === 'object' && Array.isArray(result.products)) {
    return result as StoreData;
  }
  return null;
}

// Check if Upstash Redis / Vercel KV is configured in environment
function getRedisClient() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.STORAGE_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN;

  if (url && token) {
    try {
      const { Redis } = require('@upstash/redis');
      return new Redis({ url, token });
    } catch (e) {
      console.warn('Could not initialize Redis client:', e);
    }
  }
  return null;
}

export async function getStoreDataAsync(): Promise<StoreData> {
  const redis = getRedisClient();
  if (redis) {
    try {
      const raw = await redis.get(REDIS_KEY);
      const parsed = parseStoreData(raw);
      if (parsed) {
        inMemoryStore = parsed;
        return inMemoryStore;
      } else {
        // Auto-seed Redis if empty
        try {
          await redis.set(REDIS_KEY, defaultData);
        } catch (seedErr) {
          console.warn('Could not seed Redis:', seedErr);
        }
        return defaultData as StoreData;
      }
    } catch (err) {
      console.warn('Redis get failed, falling back to file/memory:', err);
    }
  }

  // Fallback to local filesystem
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = parseStoreData(fileContent);
      if (parsed) {
        inMemoryStore = parsed;
        return inMemoryStore;
      }
    }
  } catch (error) {
    console.warn('Could not read from data/products.json:', error);
  }

  return inMemoryStore;
}

export function getStoreData(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = parseStoreData(fileContent);
      if (parsed) {
        inMemoryStore = parsed;
        return inMemoryStore;
      }
    }
  } catch (error) {
    console.warn('Sync read from data/products.json failed:', error);
  }
  return inMemoryStore;
}

export async function saveStoreDataAsync(data: StoreData): Promise<boolean> {
  inMemoryStore = data;
  let saved = false;

  // 1. Save to Redis / Vercel KV if available (pass raw object to avoid double-stringification)
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(REDIS_KEY, data);
      saved = true;
    } catch (err) {
      console.warn('Redis set failed:', err);
    }
  }

  // 2. Save to local filesystem if writable
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    saved = true;
  } catch (error) {
    // Expected on Vercel read-only filesystem
    console.warn('Filesystem write skipped (read-only environment)');
  }

  return saved || true;
}

export function saveStoreData(data: StoreData): boolean {
  inMemoryStore = data;
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    return false;
  }
}
