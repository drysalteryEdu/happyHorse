import { defineStore } from 'pinia'
import { generateBoard } from '@/utils/boardGenerator'
import { generateQuestion } from '@/utils/questionGenerator'
import type { GameState, Player, GameAction, CharData } from '@/types'

const BOARD_SIZE = 30
const WIN_POS = BOARD_SIZE - 1

export const useGameStore = defineStore('game', {
  state: (): GameState & { gradeChars: CharData[] } => ({
    board: [],
    players: [],
    currentPlayerIdx: 0,
    phase: 'waiting',
    diceValue: null,
    currentQuestion: null,
    lastAnswerCorrect: null,
    winner: null,
    grade: 1,
    semester: 'lower',
    gradeChars: [],
  }),

  getters: {
    currentPlayer: (state) => state.players[state.currentPlayerIdx],
    isMyTurn: (state) => (myId: string) =>
      state.players[state.currentPlayerIdx]?.id === myId,
  },

  actions: {
    async loadGradeData(grade: number, semester: 'upper' | 'lower') {
      this.grade = grade
      this.semester = semester
      const res = await fetch(`/data/grade${grade}-${semester}.json`)
      this.gradeChars = await res.json()
    },

    initGame(host: Player, guest: Player) {
      this.board = generateBoard(this.gradeChars)
      this.players = [
        { ...host, position: 0 },
        { ...guest, position: 0 },
      ]
      this.currentPlayerIdx = 0
      this.phase = 'rolling'
      this.diceValue = null
      this.currentQuestion = null
      this.lastAnswerCorrect = null
      this.winner = null
    },

    handleAction(action: GameAction, actorId: string) {
      const cp = this.players[this.currentPlayerIdx]
      // 非当前玩家的操作忽略（除了 join）
      if (cp?.id !== actorId) return

      if (action.type === 'roll' && this.phase === 'rolling') {
        this._roll()
      } else if (action.type === 'answer' && this.phase === 'answering') {
        this._checkAnswer(action.optionIndex)
      } else if (action.type === 'next' && this.phase === 'result') {
        this._nextTurn()
      }
    },

    _roll() {
      const dice = Math.ceil(Math.random() * 6)
      this.diceValue = dice
      const cp = this.players[this.currentPlayerIdx]
      const newPos = Math.min(cp.position + dice, WIN_POS)
      cp.position = newPos

      if (newPos === WIN_POS) {
        this.phase = 'finished'
        this.winner = cp.name
        return
      }

      const cell = this.board[newPos]
      if (cell.type === 'start' || cell.type === 'finish') {
        this.phase = 'result'
        this.currentQuestion = null
        this.lastAnswerCorrect = null
        return
      }

      this.currentQuestion = generateQuestion(cell.type, cell.charData, this.gradeChars)
      this.phase = 'answering'
    },

    _checkAnswer(optionIndex: number) {
      if (!this.currentQuestion) return
      const correct = optionIndex === this.currentQuestion.correctIndex
      this.lastAnswerCorrect = correct
      const cp = this.players[this.currentPlayerIdx]

      if (!correct) {
        // 答错退3格，最少回到起点
        cp.position = Math.max(0, cp.position - 3)
      }
      // 答对不额外奖励（可扩展：背出成语/诗句再+3）
      this.phase = 'result'
    },

    _nextTurn() {
      this.currentPlayerIdx = (this.currentPlayerIdx + 1) % this.players.length
      this.phase = 'rolling'
      this.currentQuestion = null
      this.lastAnswerCorrect = null
    },

    applyRemoteState(state: Omit<GameState, never>) {
      // Guest 直接镜像 Host 推送的状态（gradeChars 本地加载，不参与同步）
      Object.assign(this, state)
    },
  },
})
