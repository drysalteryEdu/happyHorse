<template>
  <div class="board-wrap">
    <div class="board">
      <div
        v-for="(cell, idx) in game.board"
        :key="cell.id"
        class="cell"
        :class="[`cell-${cell.type}`, { active: isActive(idx) }]"
        :style="cellStyle(idx)"
        :data-testid="`cell-${idx}`"
      >
        <span class="cell-char">{{ cell.char }}</span>
        <!-- 棋子 -->
        <div class="tokens">
          <span
            v-for="p in playersAt(idx)"
            :key="p.id"
            class="token"
            :class="{ 'token-host': p.isHost, 'token-guest': !p.isHost }"
            :title="p.name"
          >{{ p.name.charAt(0) }}</span>
        </div>
        <span v-if="cell.type !== 'start' && cell.type !== 'finish'" class="cell-label">
          {{ CELL_LABELS[cell.type] }}
        </span>
      </div>
    </div>
    <!-- 图例 -->
    <div class="legend">
      <div v-for="(label, type) in CELL_LABELS" :key="type" class="legend-item">
        <span class="legend-dot" :class="`cell-${type}`"></span>
        <span>{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { cellPosition } from '@/utils/boardGenerator'
import type { CellType } from '@/types'

const game = useGameStore()

const CELL_LABELS: Record<Exclude<CellType, 'start' | 'finish'>, string> = {
  khaki: '部首',
  darkGreen: '换首',
  yellow: '多音',
  pink: '鼻音',
  lightGreen: '字典',
  blue: '同音',
  gray: '笔画',
  purple: '音序',
  orange: '拼音',
}

function cellStyle(idx: number) {
  const [row, col] = cellPosition(idx)
  return { gridRow: row + 1, gridColumn: col + 1 }
}

function isActive(idx: number) {
  return game.players.some(p => p.position === idx && game.currentPlayerIdx === game.players.indexOf(game.players.find(pl => pl.position === idx)!))
}

function playersAt(idx: number) {
  return game.players.filter(p => p.position === idx)
}
</script>

<style scoped>
.board-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.board {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 4px;
  min-height: 210px;
}

.cell {
  position: relative;
  border-radius: 8px;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: 2px solid transparent;
  transition: transform 0.15s;
  cursor: default;
}

.cell.active { border-color: #f39c12; transform: scale(1.05); z-index: 2; }

.cell-char { font-size: 18px; font-weight: 700; line-height: 1.2; }
.cell-label { font-size: 9px; opacity: 0.8; }

.tokens { position: absolute; top: 2px; right: 2px; display: flex; gap: 1px; flex-wrap: wrap; max-width: 28px; }
.token {
  width: 14px; height: 14px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 700; color: #fff;
  border: 1px solid rgba(255,255,255,0.6);
}
.token-host { background: #e74c3c; }
.token-guest { background: #2980b9; }

/* 格子颜色 */
.cell-start    { background: #27ae60; color: #fff; }
.cell-finish   { background: #e74c3c; color: #fff; }
.cell-khaki    { background: #d2b48c; color: #3d2b1f; }
.cell-darkGreen { background: #27ae60; color: #fff; }
.cell-yellow   { background: #f1c40f; color: #3d2b1f; }
.cell-pink     { background: #e91e8c; color: #fff; }
.cell-lightGreen { background: #2ecc71; color: #fff; }
.cell-blue     { background: #2980b9; color: #fff; }
.cell-gray     { background: #7f8c8d; color: #fff; }
.cell-purple   { background: #8e44ad; color: #fff; }
.cell-orange   { background: #e67e22; color: #fff; }

/* 图例 */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  font-size: 11px;
  color: #666;
  padding: 0 4px;
}
.legend-item { display: flex; align-items: center; gap: 4px; }
.legend-dot {
  width: 12px; height: 12px; border-radius: 3px;
  flex-shrink: 0;
}
</style>
