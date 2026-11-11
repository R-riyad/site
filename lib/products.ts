import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { StoreData } from '@/types';
import defaultData from '@/data/products.json';
export { formatPrice } from './format';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'products.json');
const REDIS_KEY = 'vitrin_store_data';
let inMemoryStore: StoreData = defaultData as StoreData;

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || process.env.STORAGE_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || process.env.STORAGE_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

async function getDatabase() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as CloudflareEnv).STORE;
  } catch {
    return null;
  }
}

function publicStoreData(data: StoreData): StoreData {
  const { adminPin: _adminPin, ...settings } = (data.settings || {}) as StoreData['settings'] & { adminPin?: string };
  return { ...data, settings };
}

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

export async function getStoreDataAsync(): Promise<StoreData> {
  const db = await getDatabase();
  if (db) {
    const row = await db.prepare('SELECT value FROM store WHERE id = 1').first() as { value: string } | null;
    if (row?.value) {
      const parsed = parseStoreData(row.value);
      if (parsed) {
        inMemoryStore = publicStoreData(parsed);
        return inMemoryStore;
      }
    }
    const seed = publicStoreData(defaultData as StoreData);
    await db.prepare('INSERT OR IGNORE INTO store (id, value) VALUES (1, ?)').bind(JSON.stringify(seed)).run();
    inMemoryStore = seed;
    return seed;
  }
  const redis = getRedisClient();
  if (redis) {
    try {
      const parsed = parseStoreData(await redis.get(REDIS_KEY));
      if (parsed) {
        inMemoryStore = publicStoreData(parsed);
        return inMemoryStore;
      }
      const seed = publicStoreData(defaultData as StoreData);
      await redis.set(REDIS_KEY, seed);
      inMemoryStore = seed;
      return seed;
    } catch (error) {
      console.warn('Could not read from Vercel KV/Upstash:', error);
    }
  }
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = parseStoreData(fileContent);
      if (parsed) {
        inMemoryStore = publicStoreData(parsed);
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
  const safeData = publicStoreData(data);
  inMemoryStore = safeData;
  const db = await getDatabase();
  if (db) {
    try {
      await db.prepare('INSERT INTO store (id, value) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value')
        .bind(JSON.stringify(safeData)).run();
      return true;
    } catch (error) {
      console.error('Could not save store data to D1:', error);
      return false;
    }
  }
  const redis = getRedisClient();
  if (redis) {
    try {
      const payload = JSON.stringify(safeData);
      if (new TextEncoder().encode(payload).byteLength > 900_000) {
        console.error('Store data exceeds the safe Vercel KV value size. Use uploaded image URLs instead of embedded image data.');
        return false;
      }
      await redis.set(REDIS_KEY, safeData);
      return true;
    } catch (error) {
      console.error('Could not save store data to Vercel KV/Upstash:', error);
      return false;
    }
  }
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(safeData, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Could not save data/products.json:', error);
    return false;
  }
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
