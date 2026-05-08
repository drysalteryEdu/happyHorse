import { shuffle, pickOne, levenshtein } from './random.js'

/**
 * 生成一道题目
 * @param {object} target       - 本题目标字 CharacterRecord
 * @param {object[]} pool       - 全部可用字（用于抽干扰项）
 * @param {'A'|'B'|'MIXED'} mode - A=字→义，B=义→字
 * @returns {{ stem, options: string[], correctIndex: number, targetChar: string, targetMeaning: string }}
 */
export function generateQuestion(target, pool, mode) {
  const effectiveMode = mode === 'MIXED'
    ? (Math.random() < 0.5 ? 'A' : 'B')
    : mode

  if (effectiveMode === 'A') {
    return generateCharToMeaning(target, pool)
  } else {
    return generateMeaningToChar(target, pool)
  }
}

/** 题型 A：展示汉字，选正确义项 */
function generateCharToMeaning(target, pool) {
  const correctMeaning = pickOne(target.meanings)
  const distractors = getDistractorMeanings(correctMeaning, target, pool, 3)

  const options = shuffle([correctMeaning, ...distractors])
  return {
    mode: 'A',
    stem: target.char,
    stemPinyin: target.pinyin,
    options,
    correctIndex: options.indexOf(correctMeaning),
    targetChar: target.char,
    targetMeaning: correctMeaning,
  }
}

/** 题型 B：展示义项，选正确汉字 */
function generateMeaningToChar(target, pool) {
  const meaning = pickOne(target.meanings)
  const distractors = getDistractorChars(target, meaning, pool, 3)

  const options = shuffle([target.char, ...distractors])
  return {
    mode: 'B',
    stem: meaning,
    stemPinyin: '',
    options,
    correctIndex: options.indexOf(target.char),
    targetChar: target.char,
    targetMeaning: meaning,
  }
}

/** 为题型 A 选 count 个义项干扰项 */
function getDistractorMeanings(correctMeaning, target, pool, count) {
  const candidates = []

  // 优先：同年级其他字的义项
  for (const c of pool) {
    if (c.char === target.char) continue
    for (const m of c.meanings) {
      if (m === correctMeaning) continue
      // 义项相似度检查（避免歧义）
      if (levenshtein(m, correctMeaning) > 4) {
        candidates.push(m)
      }
    }
  }

  if (candidates.length < count) {
    // 兜底：从 pool 里再次取（放宽相似度限制）
    for (const c of pool) {
      if (c.char === target.char) continue
      for (const m of c.meanings) {
        if (!candidates.includes(m) && m !== correctMeaning) {
          candidates.push(m)
        }
      }
    }
  }

  return shuffle(candidates).slice(0, count)
}

/** 为题型 B 选 count 个汉字干扰项 */
function getDistractorChars(target, meaning, pool, count) {
  const others = pool.filter(c => c.char !== target.char)

  // 优先：同部首或笔画相近（±2）的字
  const similar = others.filter(c =>
    (target.radical && c.radical === target.radical) ||
    (target.strokes && Math.abs((c.strokes || 0) - (target.strokes || 0)) <= 2)
  )

  const candidates = [
    ...shuffle(similar),
    ...shuffle(others.filter(c => !similar.includes(c))),
  ]

  return candidates.slice(0, count).map(c => c.char)
}

/**
 * 计算得分
 * @param {boolean} isCorrect
 * @param {number}  timeMs          - 玩家作答耗时（毫秒）
 * @param {number}  roundDurationMs - 本轮总时长（毫秒）
 * @param {boolean} isFirst         - 是否是第一个答对的玩家
 * @returns {number}
 */
export function calculateScore(isCorrect, timeMs, roundDurationMs, isFirst) {
  if (!isCorrect) return 0
  const base = 100
  const speedRatio = Math.max(0, 1 - timeMs / roundDurationMs)
  const speedBonus = Math.round(speedRatio * 50)
  const firstBonus = isFirst ? 20 : 0
  return base + speedBonus + firstBonus
}

/** 从已用字集合外，随机选一个目标字 */
export function pickTarget(pool, usedChars) {
  const available = pool.filter(c => !usedChars.has(c.char))
  if (available.length === 0) return pickOne(pool) // 全部用完则重新随机
  return pickOne(available)
}
