export function createHistory(max = 100) {
  const entries = [];
  let index = -1;

  return {
    add(cmd) {
      if (!cmd || cmd === entries[entries.length - 1]) return;
      entries.push(cmd);
      if (entries.length > max) entries.shift();
      index = entries.length;
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
    }
  };
}
