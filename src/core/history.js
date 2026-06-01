const STORAGE_KEY = 'terminal:history';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(entries) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch {}
}

export function createHistory(max = 100) {
  const entries = load();
  let index = entries.length;

  return {
    add(cmd) {
      if (!cmd || cmd === entries[entries.length - 1]) return;
      entries.push(cmd);
      if (entries.length > max) entries.shift();
      index = entries.length;
      save(entries);
    },

    up() {
      if (entries.length === 0) return null;
      index = Math.max(0, index - 1);
      return entries[index];
    },

    down() {
      if (entries.length === 0) return null;
      index = Math.min(entries.length, index + 1);
      return index < entries.length ? entries[index] : null;
    },

    reset() {
      index = entries.length;
    },

    clear() {
      entries.length = 0;
      index = 0;
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  };
}
