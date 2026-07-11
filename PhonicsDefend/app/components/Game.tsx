'use client'
import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { Cell, HandItem } from '../types'
import GridCell from './GridCell'
import LetterBlock from './LetterBlock'
import { lookupSynthesis } from '../data/words'
import { playSynthesis, playPlace, playReturn, playInvalid } from '../utils/sounds'

const ROWS = 3
const COLS = 5

// Demo hand — Level 2 Unit 2+4: -at / -ig / -en / -og / -ug 词族
const INITIAL_HAND: HandItem[] = [
  { id: 'h-c',  type: 'letter', value: 'c' },
  { id: 'h-b',  type: 'letter', value: 'b' },
  { id: 'h-p',  type: 'letter', value: 'p' },
  { id: 'h-d',  type: 'letter', value: 'd' },
  { id: 'h-h',  type: 'letter', value: 'h' },
  { id: 'h-m',  type: 'letter', value: 'm' },
  { id: 'h-at', type: 'rime',   value: '-at' },
  { id: 'h-ig', type: 'rime',   value: '-ig' },
  { id: 'h-en', type: 'rime',   value: '-en' },
  { id: 'h-og', type: 'rime',   value: '-og' },
  { id: 'h-ug', type: 'rime',   value: '-ug' },
]

function makeEmptyCells(): Record<string, Cell> {
  const cells: Record<string, Cell> = {}
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const id = `cell-${r}-${c}`
      cells[id] = { id, type: 'empty', value: '' }
    }
  }
  return cells
}

function overlayTextSize(value: string) {
  if (value.length <= 1) return 'text-3xl sm:text-5xl'
  if (value.length <= 3) return 'text-2xl sm:text-4xl'
  return 'text-xl sm:text-3xl'
}

export default function Game() {
  const [cells, setCells] = useState(makeEmptyCells)
  const [hand, setHand] = useState<HandItem[]>(INITIAL_HAND)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  )

  const getActive = useCallback((): { value: string; type: 'letter' | 'rime' | 'hero' } | null => {
    if (!activeId) return null
    const hi = hand.find(h => h.id === activeId)
    if (hi) return hi
    const c = cells[activeId]
    if (c && c.type !== 'empty') return { value: c.value, type: c.type }
    return null
  }, [activeId, hand, cells])

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveId(null)
    if (!over) return

    const sourceId = String(active.id)
    const targetId = String(over.id)
    if (sourceId === targetId) return
    if (!targetId.startsWith('cell-')) return

    const sourceHand = hand.find(h => h.id === sourceId)
    const sourceCell = cells[sourceId]
    const targetCell = cells[targetId]

    if (sourceHand) {
      // Hand → cell
      if (targetCell.type === 'empty') {
        playPlace()
        setHand(p => p.filter(h => h.id !== sourceId))
        setCells(p => ({ ...p, [targetId]: { id: targetId, type: sourceHand.type, value: sourceHand.value } }))
      } else if (targetCell.type !== 'hero') {
        // Try synthesis
        const hit = lookupSynthesis(sourceHand.value, targetCell.value)
        if (hit) {
          playSynthesis()
          setHand(p => p.filter(h => h.id !== sourceId))
          setCells(p => ({ ...p, [targetId]: { id: targetId, type: 'hero', value: hit.word, emoji: hit.emoji } }))
        } else {
          playInvalid()
        }
      }
    } else if (sourceCell && sourceCell.type !== 'empty') {
      // Cell → cell
      if (targetCell.type === 'empty') {
        playPlace()
        setCells(p => ({
          ...p,
          [sourceId]: { id: sourceId, type: 'empty', value: '' },
          [targetId]: { ...sourceCell, id: targetId },
        }))
      } else if (targetCell.type !== 'hero' && sourceCell.type !== 'hero') {
        const hit = lookupSynthesis(sourceCell.value, targetCell.value)
        if (hit) {
          playSynthesis()
          setCells(p => ({
            ...p,
            [sourceId]: { id: sourceId, type: 'empty', value: '' },
            [targetId]: { id: targetId, type: 'hero', value: hit.word, emoji: hit.emoji },
          }))
        } else {
          playPlace()
          // Swap
          setCells(p => ({
            ...p,
            [sourceId]: { ...targetCell, id: sourceId },
            [targetId]: { ...sourceCell, id: targetId },
          }))
        }
      }
    }
  }

  function handleRemoveFromCell(cellId: string) {
    const cell = cells[cellId]
    if (cell.type === 'empty' || cell.type === 'hero') return
    playReturn()
    const newItem: HandItem = { id: `h-${Date.now()}`, type: cell.type as 'letter' | 'rime', value: cell.value }
    setHand(p => [...p, newItem])
    setCells(p => ({ ...p, [cellId]: { id: cellId, type: 'empty', value: '' } }))
  }

  function handleReset() {
    setCells(makeEmptyCells())
    setHand(INITIAL_HAND)
  }

  const active = getActive()
  const heroCount = Object.values(cells).filter(c => c.type === 'hero').length

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-gradient-to-b from-sky-500 to-indigo-600 px-3 py-6 gap-5"
      style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      {/* Header */}
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg tracking-wide">
          🛡️ 拼读保卫战
        </h1>
        <p className="text-sky-100 text-sm mt-1">
          Level 2 · Short Vowels
          {heroCount > 0 && <span className="ml-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">{heroCount} 个英雄 ✨</span>}
        </p>
      </header>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* 3×5 Battle Grid */}
        <section className="bg-white/20 backdrop-blur-sm rounded-3xl p-3 sm:p-5 shadow-2xl w-full max-w-sm sm:max-w-lg">
          <p className="text-[11px] text-sky-100 text-center mb-2 uppercase tracking-widest">战场 · 3×5</p>
          <div
            className="grid gap-2 sm:gap-3"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          >
            {Array.from({ length: ROWS }, (_, r) =>
              Array.from({ length: COLS }, (_, c) => {
                const id = `cell-${r}-${c}`
                return <GridCell key={id} cell={cells[id]} onDoubleClick={() => handleRemoveFromCell(id)} />
              })
            )}
          </div>
        </section>

        {/* Hand area */}
        <section className="bg-white/20 backdrop-blur-sm rounded-3xl p-3 sm:p-5 shadow-xl w-full max-w-sm sm:max-w-lg">
          <p className="text-[11px] text-sky-100 text-center mb-3 uppercase tracking-widest">
            手牌区 · 拖入战场
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            {hand.map(item => <LetterBlock key={item.id} item={item} />)}
            {hand.length === 0 && (
              <p className="text-sky-200 text-sm py-2 w-full text-center">所有字母已上场 ✓</p>
            )}
          </div>
        </section>

        <DragOverlay dropAnimation={null}>
          {active && (
            <div className={[
              'w-14 h-14 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center',
              'shadow-2xl rotate-3 scale-110 pointer-events-none',
              active.type === 'rime' ? 'bg-emerald-400' : 'bg-blue-400',
            ].join(' ')}>
              <span className={`${overlayTextSize(active.value)} font-black text-white`}>
                {active.value}
              </span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Tips + Reset */}
      <footer className="flex flex-col items-center gap-2">
        <p className="text-xs text-sky-200 text-center leading-relaxed">
          💡 字母 + 词根 → 单词英雄 &nbsp;|&nbsp; 双击格子退回手牌
        </p>
        <button
          onClick={handleReset}
          className="text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/50 rounded-full px-4 py-1 transition-all"
        >
          重新开始
        </button>
      </footer>
    </div>
  )
}
