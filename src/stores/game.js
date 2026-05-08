import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadGrades, filterCharacters, registerCustomSet, getCustomSet, AVAILABLE_GRADES } from '../data/index.js'
import { generateQuestion, calculateScore, pickTarget } from '../utils/gameEngine.js'
import { scheduleAIAnswer } from '../utils/aiPlayer.js'

export const useGameStore = defineStore('game', () => {
  // ── 阶段状态机 ─────────────────────────────────────────
  // 'idle' | 'lobby' | 'battle' | 'round_result' | 'game_result'
  const phase = ref('idle')

  // ── 游戏配置 ──────────────────────────────────────────
  const config = ref({
    grades: [1],
    tiers: [1, 2],       // 1=一类字，2=二类字
    gameMode: 'A',       // 'A'=字→义，'B'=义→字，'MIXED'=混合
    battleMode: 'hot_seat', // 'hot_seat' | 'vs_ai'
    aiDifficulty: 'medium',
    totalRounds: 10,
    timePerRound: 15,    // 秒
    player1Name: '玩家一',
    player2Name: '玩家二',
  })

  // ── 玩家状态 ──────────────────────────────────────────
  const players = ref([
    { id: 0, name: '玩家一', score: 0, color: '#c0392b', isAI: false },
    { id: 1, name: '玩家二', score: 0, color: '#2471a3', isAI: false },
  ])

  // ── 对战状态 ──────────────────────────────────────────
  const currentRound = ref(0)
  const currentQuestion = ref(null)  // { mode, stem, stemPinyin, options, correctIndex, targetChar, targetMeaning }
  const roundAnswers = ref([null, null]) // null | { choiceIndex, timeMs, isCorrect, points }
  const roundHistory = ref([])
  const usedChars = ref(new Set())
  const characterPool = ref([])
  const roundStartTime = ref(null)

  // ── 计时器（由 CountdownTimer 组件驱动，store 只持有配置） ──
  const timerDone = ref(false)

  // ── AI 定时器句柄 ──────────────────────────────────────
  let aiTimerId = null

  // ── computed ──────────────────────────────────────────
  const isHotSeat = computed(() => config.value.battleMode === 'hot_seat')
  const isVsAI    = computed(() => config.value.battleMode === 'vs_ai')
  const bothAnswered = computed(() =>
    roundAnswers.value[0] !== null && roundAnswers.value[1] !== null
  )
  const firstCorrectPlayer = computed(() => {
    const a0 = roundAnswers.value[0], a1 = roundAnswers.value[1]
    if (!a0 && !a1) return -1
    if (a0?.isCorrect && !a1?.isCorrect) return 0
    if (a1?.isCorrect && !a0?.isCorrect) return 1
    if (a0?.isCorrect && a1?.isCorrect) return a0.timeMs < a1.timeMs ? 0 : 1
    return -1
  })

  // ── Actions ───────────────────────────────────────────

  function goLobby() {
    phase.value = 'lobby'
  }

  async function startGame(cfg) {
    Object.assign(config.value, cfg)
    players.value[0].name  = cfg.player1Name
    players.value[1].name  = cfg.player2Name
    players.value[0].score = 0
    players.value[1].score = 0
    players.value[1].isAI  = cfg.battleMode === 'vs_ai'

    currentRound.value = 0
    roundHistory.value = []
    usedChars.value    = new Set()

    // 加载字库
    const allChars = [
      ...(await loadGrades(cfg.grades)),
      ...getCustomSet(),
    ]
    characterPool.value = filterCharacters(allChars, { grades: cfg.grades, tiers: cfg.tiers })

    if (characterPool.value.length < 4) {
      alert('字库中字数不足（至少需要 4 个字），请调整年级或字类设置。')
      return
    }

    phase.value = 'battle'
    initRound()
  }

  function initRound() {
    currentRound.value++
    roundAnswers.value  = [null, null]
    timerDone.value     = false
    roundStartTime.value = Date.now()

    const target   = pickTarget(characterPool.value, usedChars.value)
    usedChars.value.add(target.char)
    currentQuestion.value = generateQuestion(target, characterPool.value, config.value.gameMode)

    // 如果是 vs AI 模式，调度 AI 作答
    if (isVsAI.value) {
      if (aiTimerId) clearTimeout(aiTimerId)
      aiTimerId = scheduleAIAnswer(
        config.value.aiDifficulty,
        currentQuestion.value,
        (choiceIdx) => submitAnswer(1, choiceIdx)
      )
    }
  }

  function submitAnswer(playerId, choiceIndex) {
    if (phase.value !== 'battle') return
    if (roundAnswers.value[playerId] !== null) return  // 已作答

    const timeMs    = Date.now() - roundStartTime.value
    const isCorrect = choiceIndex === currentQuestion.value.correctIndex
    const isFirst   = firstCorrectPlayer.value === -1 && isCorrect

    const points = calculateScore(
      isCorrect, timeMs,
      config.value.timePerRound * 1000,
      isFirst
    )

    roundAnswers.value[playerId] = { choiceIndex, timeMs, isCorrect, points }
    players.value[playerId].score += points

    if (bothAnswered.value || (isVsAI.value && playerId === 0)) {
      // 热座：双方均作答；vs AI：人类作答后可立即结算（AI 也会继续）
      if (bothAnswered.value) endRound()
    }
  }

  function onTimerExpire() {
    timerDone.value = true
    if (aiTimerId) { clearTimeout(aiTimerId); aiTimerId = null }
    // 未作答的一方记为弃权（null 保持不变，endRound 会处理）
    endRound()
  }

  function endRound() {
    if (aiTimerId) { clearTimeout(aiTimerId); aiTimerId = null }

    roundHistory.value.push({
      round:    currentRound.value,
      question: { ...currentQuestion.value },
      answers:  [...roundAnswers.value],
      scores:   players.value.map(p => p.score),
    })

    phase.value = 'round_result'

    setTimeout(() => {
      if (currentRound.value >= config.value.totalRounds) {
        phase.value = 'game_result'
      } else {
        phase.value = 'battle'
        initRound()
      }
    }, 2800)
  }

  function resetToLobby() {
    if (aiTimerId) { clearTimeout(aiTimerId); aiTimerId = null }
    phase.value      = 'lobby'
    currentQuestion.value = null
    roundAnswers.value    = [null, null]
  }

  function importCustomChars(records) {
    registerCustomSet(records)
  }

  return {
    // state
    phase, config, players, currentRound,
    currentQuestion, roundAnswers, roundHistory,
    timerDone, characterPool,
    // computed
    isHotSeat, isVsAI, bothAnswered, firstCorrectPlayer,
    // actions
    goLobby, startGame, initRound, submitAnswer,
    onTimerExpire, endRound, resetToLobby, importCustomChars,
    AVAILABLE_GRADES,
  }
})
