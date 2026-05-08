<template>
  <div class="player-panel" :class="[`side-${side}`, { answered: hasAnswered, correct: answerCorrect === true, wrong: answerCorrect === false }]"
       :style="{ '--player-color': player.color }">
    <div class="player-name">{{ player.name }}<span v-if="player.isAI" class="ai-badge">AI</span></div>
    <div class="player-score">{{ player.score }}</div>

    <div v-if="showKeys && !player.isAI" class="key-hints">
      <span v-for="(k, i) in keys" :key="i" class="key">{{ k }}</span>
    </div>

    <div v-if="hasAnswered" class="answer-badge">
      <span v-if="answerCorrect">✓</span>
      <span v-else>✗</span>
    </div>

    <div v-if="deltaPoints" class="delta-pts" :class="{ positive: deltaPoints > 0 }">
      {{ deltaPoints > 0 ? '+' : '' }}{{ deltaPoints }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  player:       { type: Object, required: true },
  side:         { type: String, default: 'left' },  // 'left' | 'right'
  answer:       { type: Object, default: null },     // { choiceIndex, isCorrect, points }
  showKeys:     { type: Boolean, default: true },
})

const keys = computed(() =>
  props.side === 'left' ? ['1','2','3','4'] : ['7','8','9','0']
)
const hasAnswered   = computed(() => props.answer !== null)
const answerCorrect = computed(() => props.answer?.isCorrect ?? null)
const deltaPoints   = computed(() => props.answer?.points ?? null)
</script>

<style scoped>
.player-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-4);
  border-radius: var(--radius-lg);
  background: var(--color-paper-dark);
  border: 3px solid var(--player-color);
  min-width: 110px;
  position: relative;
  transition: box-shadow var(--t-normal);
}

.player-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--player-color);
  display: flex;
  align-items: center;
  gap: var(--sp-1);
}
.ai-badge {
  font-size: 0.65rem;
  background: var(--player-color);
  color: white;
  border-radius: 3px;
  padding: 1px 4px;
}

.player-score {
  font-size: 2.2rem;
  font-weight: 900;
  font-family: var(--font-hanzi);
  color: var(--color-ink);
  line-height: 1;
}

.key-hints {
  display: flex;
  gap: var(--sp-1);
  flex-wrap: wrap;
  justify-content: center;
}
.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px; height: 22px;
  border-radius: 4px;
  background: var(--color-paper);
  border: 1px solid var(--color-stone);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-stone);
}

.answer-badge {
  position: absolute;
  top: -10px; right: -10px;
  width: 28px; height: 28px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  font-weight: 900;
}
.correct .answer-badge { background: var(--color-jade); color: white; }
.wrong   .answer-badge { background: var(--color-clay); color: white; }

.delta-pts {
  font-size: 0.8rem;
  color: var(--color-stone);
  font-weight: 700;
}
.delta-pts.positive { color: var(--color-jade); }
</style>
