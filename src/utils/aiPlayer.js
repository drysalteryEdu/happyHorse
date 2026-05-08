/**
 * AI 对手逻辑
 * 难度控制响应时间和正确率
 */

const DIFFICULTY_CONFIG = {
  easy:   { minMs: 6000, maxMs: 9000, correctRate: 0.45 },
  medium: { minMs: 3000, maxMs: 6000, correctRate: 0.75 },
  hard:   { minMs: 800,  maxMs: 3000, correctRate: 0.92 },
}

/**
 * 启动 AI 作答定时器，返回 timeoutId 以便取消
 * @param {string}   difficulty  - 'easy'|'medium'|'hard'
 * @param {object}   question    - 当前题目 { correctIndex, options }
 * @param {Function} onAnswer    - callback(choiceIndex: number)
 * @returns {number}             - setTimeout 返回的 id
 */
export function scheduleAIAnswer(difficulty, question, onAnswer) {
  const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium
  const delay = cfg.minMs + Math.random() * (cfg.maxMs - cfg.minMs)

  return setTimeout(() => {
    const choice = pickAIChoice(question.correctIndex, question.options.length, cfg.correctRate)
    onAnswer(choice)
  }, delay)
}

function pickAIChoice(correctIndex, total, correctRate) {
  if (Math.random() < correctRate) return correctIndex
  const wrong = Array.from({ length: total }, (_, i) => i).filter(i => i !== correctIndex)
  return wrong[Math.floor(Math.random() * wrong.length)]
}
