function capitalize(k) {
  return k.charAt(0).toUpperCase() + k.slice(1);
}

export function printObj(print, obj, options = {}) {
  const { indent = 0, skip = [], para = [] } = options;
  const pad = ' '.repeat(indent);
  const keys = Object.keys(obj).filter(k => !skip.includes(k));
  const maxLen = Math.max(...keys.map(k => k.length), 0);

  for (const [key, value] of Object.entries(obj)) {
    if (skip.includes(key)) continue;

    const label = capitalize(key);
    const padded = label.padEnd(maxLen + 2);

    if (para.includes(key)) {
      print('');
      print(`${pad}${value}`);
    } else if (Array.isArray(value)) {
      print(`${pad}${label}:`);
      value.forEach(item => print(`${pad}  ${item}`));
    } else {
      print(`${pad}${padded}${value}`);
    }
  }
}
