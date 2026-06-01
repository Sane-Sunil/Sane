function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export const subcommands = {
  about: ['show'],
  skills: ['show'],
  contact: ['show'],
  education: ['show'],
  experience: ['show'],
  projects: ['show'],
};

export function getSuggestions(input, candidates) {
  if (!input) return [];
  const lower = input.toLowerCase();
  return candidates.filter(c => c.toLowerCase().startsWith(lower));
}

export function findSimilar(input, candidates, maxDist = 2) {
  if (!input) return [];
  const lower = input.toLowerCase();
  return candidates.filter(c => {
    const cl = c.toLowerCase();
    if (cl === lower) return false;
    return levenshtein(lower, cl) <= maxDist || cl.includes(lower) || lower.includes(cl);
  });
}
