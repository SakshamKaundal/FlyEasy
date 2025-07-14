import { openDB } from 'idb';
import { Flights } from '@/app/types/application.types';

const DB_NAME = 'FlightCacheDB';
const STORE_NAME = 'SearchHistory';

type SearchPayload = {
  from: string;
  to: string;
  date: string;
  returnDate?: string;
};

type SearchResult = {
  oneWay: Flights[];
  return: Flights[];
};

type SearchHistoryEntry = {
  id?: number;
  email: string;
  timestamp: number;
  query: SearchPayload;
  result: SearchResult;
};

export const initDB = async () => {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('email', 'email', { unique: false });
      }
    },
  });
};

export const saveSearch = async (
  email: string,
  searchPayload: SearchPayload,
  result: SearchResult
): Promise<void> => {
  const db = await initDB();
  const entry: SearchHistoryEntry = {
    email,
    timestamp: Date.now(),
    query: searchPayload,
    result,
  };
  await db.add(STORE_NAME, entry);
};

export const getSearchHistoryByEmail = async (
  email: string
): Promise<SearchHistoryEntry[]> => {
  const db = await initDB();
  const all = await db.getAllFromIndex(STORE_NAME, 'email');
  return all.filter((entry) => entry.email === email);
};
