<template>
  <div class="dice-area">
    <div class="dice-wrap">
      <div class="dice" :class="{ rolling: isRolling }" :data-value="game.diceValue">
        <span class="dice-face">{{ diceFace }}</span>
      </div>
      <div class="turn-info">
        <span class="player-name" :class="{ mine: isMyTurn }">
          {{ isMyTurn ? '你的回合' : `${game.currentPlayer?.name} 的回合` }}
        </span>
        <span class="phase-hint">{{ phaseHint }}</span>
      </div>
    </div>

    <button
      v-if="game.phase === 'rolling'"
      :disabled="!isMyTurn || isRolling"
      data-testid="dice-btn"
      @click="roll"
    >
      🎲 掷骰子
    </button>

    <!-- "下一回合" 按钮在 QuestionCard 内部，避免被 overlay 拦截 -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { usePeerStore } from '@/stores/peer'

const game = useGameStore()
const peer = usePeerStore()
const isRolling = ref(false)

const DICE_FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const diceFace = computed(() => game.diceValue ? DICE_FACES[game.diceValue] : '🎲')

const isMyTurn = computed(() => game.currentPlayer?.id === peer.myId)

const phaseHint = computed(() => {
  if (game.phase === 'waiting') return '等待玩家加入…'
  if (game.phase === 'rolling') return isMyTurn.value ? '点击掷骰子' : '等待对方掷骰子'
  if (game.phase === 'answering') return isMyTurn.value ? '请回答问题' : '等待对方答题'
  if (game.phase === 'result') return isMyTurn.value ? '点击继续' : '等待对方继续'
  return ''
})

async function roll() {
  isRolling.value = true
  setTimeout(() => { isRolling.value = false }, 600)
  peer.sendAction({ type: 'roll' })
}

</script>

<style scoped>
.dice-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.dice-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dice {
  width: 64px; height: 64px;
  background: #fff;
  border: 3px solid var(--border);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.1s;
}

.dice.rolling {
  animation: roll-anim 0.6s ease-out;
}

@keyframes roll-anim {
  0%   { transform: rotate(0deg) scale(1); }
  25%  { transform: rotate(20deg) scale(1.1); }
  50%  { transform: rotate(-20deg) scale(1.15); }
  75%  { transform: rotate(10deg) scale(1.05); }
  100% { transform: rotate(0deg) scale(1); }
}

.turn-info { display: flex; flex-direction: column; gap: 4px; }
.player-name { font-size: 15px; font-weight: 700; color: #555; }
.player-name.mine { color: var(--accent); }
.phase-hint { font-size: 12px; color: #aaa; }

button { min-width: 130px; padding: 12px 24px; font-size: 16px; }
.next-btn { background: #27ae60; }
.next-btn:hover:not(:disabled) { background: #219a52; }
</style>
