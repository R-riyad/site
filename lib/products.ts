import fs from 'fs';
import path from 'path';
import { StoreData } from '@/types';
import defaultData from '@/data/products.json';
export { formatPrice } from './format';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'products.json');

let inMemoryStore: StoreData = defaultData as StoreData;

export function getStoreData(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(fileContent);
      inMemoryStore = parsed;
      return parsed;
    }
  } catch (error) {
    console.warn('Could not read from data/products.json, using fallback store:', error);
  }
  return inMemoryStore;
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
    console.warn('Could not write to data/products.json (filesystem may be read-only):', error);
    return false;
  }
}
