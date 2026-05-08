<template>
  <div class="round-result fade-up">
    <div class="result-char">{{ question.targetChar }}</div>
    <div class="result-meaning">
      <span class="meaning-label">正确义项：</span>{{ question.targetMeaning }}
    </div>
    <div class="result-scores">
      <div v-for="(p, i) in players" :key="i" class="player-result"
           :style="{ '--pc': p.color }">
        <span class="p-name">{{ p.name }}</span>
        <span class="p-answer-result">
          <template v-if="answers[i]">
            <span :class="answers[i].isCorrect ? 'tag-correct' : 'tag-wrong'">
              {{ answers[i].isCorrect ? '✓ 答对' : '✗ 答错' }}
            </span>
            <span class="pts" v-if="answers[i].points > 0">+{{ answers[i].points }} 分</span>
          </template>
          <span v-else class="tag-skip">— 未作答</span>
        </span>
        <span class="total-score">{{ p.score }} 分</span>
      </div>
    </div>
    <div class="next-hint">{{ countdown }}s 后继续…</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const props = defineProps({
  question: { type: Object, required: true },
  answers:  { type: Array,  required: true },
  players:  { type: Array,  required: true },
})

const countdown = ref(2)
let timer = null
onMounted(() => {
  timer = setInterval(() => { if (countdown.value > 0) countdown.value-- }, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.round-result {
  position: absolute;
  inset: 0;
  background: rgba(245,240,232,0.96);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-6);
  z-index: 10;
  border-radius: var(--radius-lg);
}

.result-char {
  font-family: var(--font-hanzi);
  font-size: clamp(3rem, 10vw, 6rem);
  color: var(--color-ink);
}

.result-meaning {
  font-size: 1rem;
  color: var(--color-stone);
  background: white;
  padding: var(--sp-3) var(--sp-6);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-paper-dark);
}
.meaning-label { color: var(--color-stone); margin-right: var(--sp-1); }

.result-scores {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  width: 100%;
  max-width: 340px;
}

.player-result {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  background: white;
  border-radius: var(--radius-md);
  border-left: 4px solid var(--pc);
}
.p-name { font-weight: 700; color: var(--pc); min-width: 60px; }
.p-answer-result { flex: 1; display: flex; align-items: center; gap: var(--sp-2); }
.total-score { font-weight: 900; font-size: 1.1rem; }

.tag-correct { background: var(--color-jade); color: white; border-radius: 4px; padding: 2px 8px; font-size: 0.8rem; }
.tag-wrong   { background: var(--color-clay); color: white; border-radius: 4px; padding: 2px 8px; font-size: 0.8rem; }
.tag-skip    { color: var(--color-stone); font-size: 0.8rem; }
.pts         { color: var(--color-jade); font-weight: 700; font-size: 0.85rem; }

.next-hint {
  font-size: 0.85rem;
  color: var(--color-stone);
  animation: pulse-red 1s ease-in-out infinite;
}
</style>
