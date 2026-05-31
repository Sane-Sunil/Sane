export function parse(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const tokens = [];
  let i = 0;
  let current = '';

  while (i < trimmed.length) {
    const ch = trimmed[i];

    if (ch === '"') {
      i++;
      while (i < trimmed.length && trimmed[i] !== '"') {
        current += trimmed[i];
        i++;
      }
      i++;
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    if (ch === ' ') {
      if (current) {
        tokens.push(current);
        current = '';
      }
      i++;
      continue;
    }

    current += ch;
    i++;
  }

  if (current) tokens.push(current);

  if (tokens.length === 0) return null;

  const command = tokens[0].toLowerCase();
  const args = [];
  const flags = [];

  for (let j = 1; j < tokens.length; j++) {
    const token = tokens[j];
    if (token.startsWith('--')) {
      flags.push(token.slice(2));
    } else if (token.startsWith('-') && token.length > 1) {
      flags.push(token.slice(1));
    } else {
      args.push(token);
    }
  }

  return { command, args, flags };
}
