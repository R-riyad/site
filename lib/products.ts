import fs from 'fs';
import path from 'path';
import { getCloudflareEnv } from './cloudflare';
import { StoreData } from '@/types';
import defaultData from '@/data/products.json';
export { formatPrice } from './format';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'products.json');
let inMemoryStore: StoreData = defaultData as StoreData;

async function getDatabase() {
  const env = await getCloudflareEnv();
  if (env && !env.STORE) throw new Error('STORE database binding is missing');
  return env?.STORE || null;
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
    if (row) {
      const parsed = parseStoreData(row.value);
      if (parsed) {
        inMemoryStore = publicStoreData(parsed);
        return inMemoryStore;
      }
      throw new Error('Stored catalog is invalid');
    }
    const seed = publicStoreData(defaultData as StoreData);
    await db.prepare('INSERT OR IGNORE INTO store (id, value) VALUES (1, ?)').bind(JSON.stringify(seed)).run();
    inMemoryStore = seed;
    return seed;
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
  const db = await getDatabase();
  if (db) {
    try {
      await db.prepare('INSERT INTO store (id, value) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value')
        .bind(JSON.stringify(safeData)).run();
      inMemoryStore = safeData;
      return true;
    } catch (error) {
      console.error('Could not save store data to D1:', error);
      return false;
    }
  }
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(safeData, null, 2), 'utf-8');
    inMemoryStore = safeData;
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
