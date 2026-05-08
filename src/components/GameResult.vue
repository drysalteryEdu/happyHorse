<template>
  <div class="game-result">
    <div class="trophy">🏆</div>
    <h2 class="winner-text">{{ winnerText }}</h2>

    <div class="final-scores">
      <div v-for="(p, i) in players" :key="i"
           class="score-card" :class="{ winner: winnerIdx === i }"
           :style="{ '--pc': p.color }">
        <div class="sc-name">{{ p.name }}<span v-if="p.isAI" class="ai-tag">AI</span></div>
        <div class="sc-score">{{ p.score }}</div>
        <div class="sc-label">分</div>
      </div>
    </div>

    <details class="history-toggle">
      <summary>查看每轮详情</summary>
      <div class="history-list">
        <div v-for="r in history" :key="r.round" class="history-row">
          <span class="hr-round">第{{ r.round }}轮</span>
          <span class="hr-char">{{ r.question.targetChar }}</span>
          <span class="hr-meaning">{{ r.question.targetMeaning }}</span>
          <span v-for="(a, i) in r.answers" :key="i" class="hr-ans"
                :style="{ color: players[i].color }">
            {{ a ? (a.isCorrect ? `+${a.points}` : '✗') : '—' }}
          </span>
        </div>
      </div>
    </details>

    <div class="action-btns">
      <button class="btn-primary" @click="emit('replay')">再来一局</button>
      <button class="btn-secondary" @click="emit('lobby')">返回设置</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  players: { type: Array, required: true },
  history: { type: Array, default: () => [] },
})
const emit = defineEmits(['replay', 'lobby'])

const winnerIdx = computed(() => {
  const [s0, s1] = props.players.map(p => p.score)
  if (s0 === s1) return -1
  return s0 > s1 ? 0 : 1
})

const winnerText = computed(() => {
  if (winnerIdx.value === -1) return '平局！势均力敌'
  return `${props.players[winnerIdx.value].name} 获胜！`
})
</script>

<style scoped>
.game-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-8);
  padding: var(--sp-12) var(--sp-8);
  max-width: 560px;
  margin: 0 auto;
}

.trophy { font-size: 4rem; }

.winner-text {
  font-size: 1.8rem;
  color: var(--color-ink);
  text-align: center;
}

.final-scores {
  display: flex;
  gap: var(--sp-6);
}
.score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--sp-6) var(--sp-8);
  border-radius: var(--radius-lg);
  background: white;
  border: 3px solid var(--color-paper-dark);
  gap: var(--sp-1);
  transition: border-color var(--t-normal), box-shadow var(--t-normal);
}
.score-card.winner {
  border-color: var(--pc);
  box-shadow: 0 0 0 4px rgba(var(--pc-rgb, 192,57,43), 0.15);
}
.sc-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--pc);
  display: flex; align-items: center; gap: var(--sp-1);
}
.ai-tag {
  font-size: 0.6rem; background: var(--pc);
  color: white; border-radius: 3px; padding: 1px 4px;
}
.sc-score {
  font-size: 3rem;
  font-weight: 900;
  font-family: var(--font-hanzi);
  color: var(--color-ink);
  line-height: 1;
}
.sc-label { font-size: 0.85rem; color: var(--color-stone); }

.history-toggle {
  width: 100%;
  border-radius: var(--radius-md);
  background: white;
  border: 1px solid var(--color-paper-dark);
  padding: var(--sp-3) var(--sp-4);
}
.history-toggle summary { cursor: pointer; font-weight: 700; color: var(--color-stone); }
.history-list { display: flex; flex-direction: column; gap: var(--sp-2); margin-top: var(--sp-3); }
.history-row {
  display: flex; align-items: center; gap: var(--sp-3);
  font-size: 0.85rem;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-sm);
  background: var(--color-paper);
}
.hr-round { color: var(--color-stone); min-width: 40px; }
.hr-char  { font-family: var(--font-hanzi); font-size: 1.1rem; font-weight: 700; min-width: 28px; }
.hr-meaning { flex: 1; color: var(--color-stone); font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hr-ans { font-weight: 700; min-width: 28px; text-align: center; }

.action-btns {
  display: flex; gap: var(--sp-4);
}
.btn-primary {
  padding: var(--sp-3) var(--sp-8);
  border-radius: var(--radius-md);
  background: var(--color-cinnabar);
  color: white;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: opacity var(--t-fast), transform var(--t-fast);
}
.btn-primary:hover { opacity: 0.9; transform: translateY(-2px); }
.btn-secondary {
  padding: var(--sp-3) var(--sp-8);
  border-radius: var(--radius-md);
  background: white;
  color: var(--color-stone);
  font-weight: 700;
  font-size: 1rem;
  border: 2px solid var(--color-paper-dark);
  cursor: pointer;
  transition: border-color var(--t-fast);
}
.btn-secondary:hover { border-color: var(--color-stone); }
</style>
