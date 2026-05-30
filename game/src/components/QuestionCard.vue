<template>
  <div class="q-overlay" @click.self="() => {}">
    <div class="q-card" :class="`q-${game.currentQuestion?.cellType ?? 'gray'}`">

      <!-- 答题阶段 -->
      <template v-if="game.phase === 'answering' && game.currentQuestion">
        <div class="q-header">
          <span class="q-type-badge">{{ cellLabel }}</span>
          <span class="q-char">{{ game.currentQuestion.char }}</span>
        </div>
        <p class="q-prompt">{{ game.currentQuestion.prompt }}</p>
        <div class="q-options">
          <button
            v-for="(opt, i) in game.currentQuestion.options"
            :key="i"
            class="q-opt"
            :disabled="!isMyTurn"
            :data-testid="`option-${i}`"
            @click="answer(i)"
          >
            <span class="opt-label">{{ LABELS[i] }}</span>
            <span class="opt-text">{{ opt }}</span>
          </button>
        </div>
        <p v-if="!isMyTurn" class="waiting-hint">等待 {{ game.currentPlayer?.name }} 作答…</p>
      </template>

      <!-- 结果阶段 -->
      <template v-if="game.phase === 'result'">
        <div class="result-icon">{{ game.lastAnswerCorrect === null ? '⏭️' : game.lastAnswerCorrect ? '✅' : '❌' }}</div>
        <p class="result-text">
          <template v-if="game.lastAnswerCorrect === null">落在普通格，继续前进！</template>
          <template v-else-if="game.lastAnswerCorrect">
            答对了！<strong>{{ game.currentPlayer?.name }}</strong> 继续前进。
          </template>
          <template v-else>
            答错了，后退 3 格。
            <br />
            <small>正确答案：{{ game.currentQuestion?.options[game.currentQuestion?.correctIndex] }}</small>
          </template>
        </p>
        <button
        v-if="isMyTurn"
        class="next-turn-btn"
        data-testid="next-btn"
        @click="next"
      >
        下一回合 →
      </button>
      <p v-if="!isMyTurn" class="waiting-hint">等待 {{ game.currentPlayer?.name }} 点击继续…</p>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { usePeerStore } from '@/stores/peer'
import type { CellType } from '@/types'

const game = useGameStore()
const peer = usePeerStore()
const LABELS = ['A', 'B', 'C', 'D']

const CELL_LABELS: Record<Exclude<CellType, 'start' | 'finish'>, string> = {
  khaki: '说部首', darkGreen: '换部首', yellow: '多音字',
  pink: '前/后鼻音', lightGreen: '字典', blue: '同音字',
  gray: '笔画数', purple: '音序', orange: '拼音',
}

const cellLabel = computed(() => {
  const t = game.currentQuestion?.cellType
  return t && t !== 'start' && t !== 'finish' ? CELL_LABELS[t] : ''
})

const isMyTurn = computed(() => game.currentPlayer?.id === peer.myId)

function answer(i: number) {
  if (!isMyTurn.value) return
  peer.sendAction({ type: 'answer', optionIndex: i })
}

function next() {
  peer.sendAction({ type: 'next' })
}
</script>

<style scoped>
.q-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 50;
  padding-bottom: 16px;
}

.q-card {
  background: var(--card);
  border-radius: 20px 20px 16px 16px;
  padding: 24px 20px;
  width: min(520px, 96vw);
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 -4px 40px rgba(0,0,0,0.2);
  border-top: 6px solid var(--border);
}

/* 颜色主题（与格子颜色对应） */
.q-khaki       { border-top-color: #d2b48c; }
.q-darkGreen   { border-top-color: #27ae60; }
.q-yellow      { border-top-color: #f1c40f; }
.q-pink        { border-top-color: #e91e8c; }
.q-lightGreen  { border-top-color: #2ecc71; }
.q-blue        { border-top-color: #2980b9; }
.q-gray        { border-top-color: #7f8c8d; }
.q-purple      { border-top-color: #8e44ad; }
.q-orange      { border-top-color: #e67e22; }

.q-header { display: flex; align-items: center; gap: 12px; }
.q-type-badge {
  background: #f0e6d3;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 13px;
  font-weight: 600;
  color: #8b6914;
}
.q-char { font-size: 36px; font-weight: 900; color: var(--accent); }
.q-prompt { font-size: 17px; font-weight: 600; line-height: 1.5; }

.q-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.q-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 2px solid var(--border);
  color: var(--text);
  text-align: left;
  padding: 12px 14px;
  font-size: 18px;
  transition: border-color 0.15s, background 0.15s;
}
.q-opt:hover:not(:disabled) {
  border-color: var(--btn);
  background: #fff8f0;
}
.opt-label {
  font-weight: 700;
  color: var(--btn);
  font-size: 14px;
  flex-shrink: 0;
}

.result-icon { font-size: 48px; text-align: center; }
.result-text { font-size: 17px; line-height: 1.7; text-align: center; }
.result-text small { color: #888; font-size: 14px; }

.waiting-hint { font-size: 13px; color: #aaa; text-align: center; }

.next-turn-btn {
  align-self: center;
  background: #27ae60;
  padding: 12px 32px;
  font-size: 16px;
}
.next-turn-btn:hover { background: #219a52; }
</style>
