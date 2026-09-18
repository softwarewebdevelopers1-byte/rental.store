const PREFIX = "hostelix.";
const LEGACY_PREFIX = "hostel" + "hub.";

function migrateLegacyValue(key: string): string | null {
  const currentKey = PREFIX + key;
  const legacyKey = LEGACY_PREFIX + key;
  const raw = localStorage.getItem(currentKey) ?? localStorage.getItem(legacyKey);

  if (raw !== null && raw !== localStorage.getItem(currentKey)) {
    localStorage.setItem(currentKey, raw);
    localStorage.removeItem(legacyKey);
  }

  return raw;
}

export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = migrateLegacyValue(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* ignore quota errors in demo */
    }
  },
  remove(key: string): void {
    localStorage.removeItem(PREFIX + key);
    localStorage.removeItem(LEGACY_PREFIX + key);
  },
  clear(): void {
    Object.keys(localStorage)
      .filter(
        (key) => key.startsWith(PREFIX) || key.startsWith(LEGACY_PREFIX),
      )
      .forEach((key) => localStorage.removeItem(key));
  },
};

export function saveLastRoute(route: string): void {
  storage.set("last.route", route);
}
