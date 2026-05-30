import type { Cell, CellType, CharData } from '@/types'

const BOARD_SIZE = 30  // 含起点和终点

const CELL_DISTRIBUTION: CellType[] = [
  'khaki', 'khaki', 'khaki',
  'darkGreen', 'darkGreen', 'darkGreen',
  'yellow', 'yellow', 'yellow',
  'pink', 'pink', 'pink',
  'lightGreen', 'lightGreen', 'lightGreen',
  'blue', 'blue', 'blue', 'blue',
  'gray', 'gray', 'gray', 'gray',
  'purple', 'purple', 'purple',
  'orange', 'orange',
]  // 共 28 个游戏格子 + start + finish = 30

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function generateBoard(chars: CharData[]): Cell[] {
  const shuffledTypes = shuffle(CELL_DISTRIBUTION)
  const shuffledChars = shuffle(chars)

  const EMPTY: CharData = { char: '', pinyin: '', strokes: 0, radical: '', homophones: [] }

  const cells: Cell[] = [
    { id: 0, type: 'start', char: '起', charData: EMPTY },
  ]

  for (let i = 0; i < BOARD_SIZE - 2; i++) {
    const charData = shuffledChars[i % shuffledChars.length]
    cells.push({
      id: i + 1,
      type: shuffledTypes[i],
      char: charData.char,
      charData,
    })
  }

  cells.push({ id: BOARD_SIZE - 1, type: 'finish', char: '终', charData: EMPTY })
  return cells
}

/** 计算每个格子在 3×10 蛇形棋盘上的 [row, col] 坐标 */
export function cellPosition(pos: number): [number, number] {
  const row = Math.floor(pos / 10)
  const col = row % 2 === 0 ? pos % 10 : 9 - (pos % 10)
  return [row, col]
}
