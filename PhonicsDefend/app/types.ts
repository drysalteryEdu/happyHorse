export type CellContentType = 'empty' | 'letter' | 'rime' | 'hero'

export interface Cell {
  id: string
  type: CellContentType
  value: string
  emoji?: string
}

export interface HandItem {
  id: string
  type: 'letter' | 'rime'
  value: string
}
