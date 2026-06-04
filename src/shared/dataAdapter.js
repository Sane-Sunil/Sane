let cache = null;

export async function getData() {
  if (cache) return cache;
  const res = await fetch('./data/portfolio.json');
  if (!res.ok) throw new Error('Failed to load portfolio data');
  cache = await res.json();
  return cache;
}
