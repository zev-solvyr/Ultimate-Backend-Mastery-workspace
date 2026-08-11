const DB_NAME = "backend-interview-files-db";
const DB_VERSION = 1;
const STORE_NAME = "files";

export interface StoredFileRecord {
  id: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  updatedAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported in this environment."));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveFileBlob(
  id: string,
  blob: Blob,
  fileName: string,
  mimeType: string
): Promise<string> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const record: StoredFileRecord = {
      id,
      blob,
      fileName,
      mimeType,
      updatedAt: new Date().toISOString(),
    };
    const req = store.put(record);
    req.onsuccess = () => resolve(id);
    req.onerror = () => reject(req.error);
  });
}

export async function getFileRecord(id: string): Promise<StoredFileRecord | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to fetch file from IndexedDB:", err);
    return null;
  }
}

export async function deleteFileBlob(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error("Failed to delete file from IndexedDB:", err);
  }
}

export async function openFileInNewTab(id: string): Promise<boolean> {
  const record = await getFileRecord(id);
  if (!record || !record.blob) {
    alert("File content not found in local browser storage.");
    return false;
  }
  const url = URL.createObjectURL(record.blob);
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}

export async function downloadFileBlob(id: string, fallbackFileName?: string): Promise<boolean> {
  const record = await getFileRecord(id);
  if (!record || !record.blob) {
    alert("File content not found in local browser storage.");
    return false;
  }
  const url = URL.createObjectURL(record.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = record.fileName || fallbackFileName || "download";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return true;
}
