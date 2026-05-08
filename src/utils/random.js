/** Fisher-Yates shuffle（原地） */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** 从数组随机取 n 个不重复元素（n > arr.length 时返回全部打乱结果） */
export function pickN(arr, n) {
  return shuffle([...arr]).slice(0, Math.min(n, arr.length))
}

/** 从数组随机取 1 个元素 */
export function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** 简易 Levenshtein 距离（用于判断两义项是否相似） */
export function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    }
  }
  return dp[m][n]
}
