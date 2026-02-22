/**
 * Interface and implementations for handling data persistence.
 */

export interface StorageService {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}

/**
 * Web-based storage service using localStorage.
 */
class LocalStorageService implements StorageService {
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }
}

// In a real dual-mode environment (e.g. Electron), we could inject 
// a SQLite implementation if better-sqlite3 is available.
// For now, we standardize on LocalStorage as it's a web project.
export const storageService: StorageService = new LocalStorageService();
