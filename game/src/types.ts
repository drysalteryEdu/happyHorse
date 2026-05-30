export type CellType =
  | 'start' | 'finish'
  | 'khaki'       // 卡其 - 说部首并写含该部首的新字
  | 'darkGreen'   // 深绿 - 换部首变新字
  | 'yellow'      // 黄色 - 多音字读音
  | 'pink'        // 粉色 - 前/后鼻音
  | 'lightGreen'  // 浅绿 - 字典页码（备用：笔画）
  | 'blue'        // 蓝色 - 同音字
  | 'gray'        // 灰色 - 笔画数
  | 'purple'      // 紫色 - 音序（拼音首字母）
  | 'orange'      // 橙色 - 拼音

export interface CharData {
  char: string
  pinyin: string
  strokes: number
  radical: string
  homophones: string[]
}

export interface Cell {
  id: number
  type: CellType
  char: string
  charData: CharData
}

export interface Player {
  id: string      // peer ID
  name: string
  position: number
  isHost: boolean
}

export type GamePhase =
  | 'waiting'     // 等待第二位玩家
  | 'rolling'     // 等待当前玩家掷骰子
  | 'answering'   // 正在答题
  | 'result'      // 显示答题结果
  | 'finished'    // 游戏结束

export interface Question {
  cellType: CellType
  char: string
  prompt: string
  options: string[]
  correctIndex: number
}

export interface GameState {
  board: Cell[]
  players: Player[]
  currentPlayerIdx: number
  phase: GamePhase
  diceValue: number | null
  currentQuestion: Question | null
  lastAnswerCorrect: boolean | null
  winner: string | null
  grade: number
  semester: 'upper' | 'lower'
}

// PeerJS 消息协议
export type PeerMessage =
  | { type: 'state'; payload: GameState }
  | { type: 'action'; action: GameAction }
  | { type: 'join'; playerName: string; peerId: string }

export type GameAction =
  | { type: 'roll' }
  | { type: 'answer'; optionIndex: number }
  | { type: 'next' }   // 继续下一回合
