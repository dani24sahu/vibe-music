const DB_NAME = "vibe-offline";
const DB_VERSION = 2;

export const IDB_STORES = {
  songs: "songs",
  albums: "albums",
  artists: "artists",
  playlists: "playlists",
  lyrics: "lyrics-v2",
} as const;

export type IdbStoreName = (typeof IDB_STORES)[keyof typeof IDB_STORES];

export type CachedRecord<T> = {
  id: string;
  data: T;
  cachedAt: number;
};

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (db.objectStoreNames.contains("lyrics")) {
          db.deleteObjectStore("lyrics");
        }
        for (const store of Object.values(IDB_STORES)) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: "id" });
          }
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  return dbPromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function idbGet<T>(store: IdbStoreName, id: string): Promise<CachedRecord<T> | null> {
  const db = await openDb();
  if (!db) return null;
  try {
    const record = await requestToPromise(
      db.transaction(store, "readonly").objectStore(store).get(id),
    );
    return (record as CachedRecord<T> | undefined) ?? null;
  } catch {
    return null;
  }
}

export async function idbPut<T>(store: IdbStoreName, record: CachedRecord<T>) {
  const db = await openDb();
  if (!db) return;
  try {
    await requestToPromise(
      db.transaction(store, "readwrite").objectStore(store).put(record),
    );
  } catch {
    // Quota / private mode should not break the app.
  }
}

export async function idbTrim(store: IdbStoreName, maxEntries: number) {
  if (maxEntries <= 0) return;
  const db = await openDb();
  if (!db) return;
  try {
    const tx = db.transaction(store, "readwrite");
    const objectStore = tx.objectStore(store);
    const records = (await requestToPromise(objectStore.getAll())) as CachedRecord<unknown>[];
    if (records.length <= maxEntries) return;
    records.sort((a, b) => a.cachedAt - b.cachedAt);
    const extra = records.length - maxEntries;
    await Promise.all(
      records.slice(0, extra).map((record) => requestToPromise(objectStore.delete(record.id))),
    );
  } catch {
    // ignore
  }
}
