import { openDB } from 'idb';
import { Flights } from '@/app/types/application.types';

const DB_NAME = 'FlightCacheDB';
const STORE_NAME = 'SearchHistory';
const BOOKINGS_STORE = 'BookingsCache';

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
  return await openDB(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('email', 'email', { unique: false });
      }

      // v2: store latest bookings per email for offline use
      if (!db.objectStoreNames.contains(BOOKINGS_STORE)) {
        const bookings = db.createObjectStore(BOOKINGS_STORE, {
          keyPath: 'email',
        });
        bookings.createIndex('email', 'email', { unique: true });
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

// ------------------------
// Bookings offline cache
// ------------------------

type CachedBookingsEntry = {
  email: string;
  timestamp: number;
  bookings: unknown[];
};

export const saveBookingsForEmail = async (
  email: string,
  bookings: unknown[]
): Promise<void> => {
  const db = await initDB();
  const entry: CachedBookingsEntry = {
    email,
    timestamp: Date.now(),
    bookings,
  };
  // put to upsert by primary key `email`
  await db.put(BOOKINGS_STORE, entry);
};

export const getCachedBookingsForEmail = async (
  email: string
): Promise<unknown[] | null> => {
  const db = await initDB();
  const entry = (await db.get(BOOKINGS_STORE, email)) as CachedBookingsEntry | undefined;
  return entry?.bookings ?? null;
};
