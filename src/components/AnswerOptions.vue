<template>
  <div class="answer-grid">
    <button
      v-for="(opt, i) in question.options"
      :key="i"
      class="answer-btn"
      :class="btnClass(i)"
      :disabled="disabled"
      @click="emit('choose', i)"
    >
      <span class="opt-index">{{ LABELS[i] }}</span>
      <span class="opt-text">{{ opt }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const LABELS = ['A', 'B', 'C', 'D']

const props = defineProps({
  question:   { type: Object, required: true },
  answers:    { type: Array,  default: () => [null, null] }, // per-player answers
  revealed:   { type: Boolean, default: false }, // 显示正误（round_result 阶段）
  disabled:   { type: Boolean, default: false },
})
const emit = defineEmits(['choose'])

function btnClass(i) {
  if (!props.revealed) return {}
  const isCorrect = i === props.question.correctIndex
  const chosen0 = props.answers[0]?.choiceIndex === i
  const chosen1 = props.answers[1]?.choiceIndex === i
  return {
    'opt-correct':    isCorrect,
    'opt-chosen-p1':  chosen0 && !isCorrect,
    'opt-chosen-p2':  chosen1 && !isCorrect,
    'opt-both-wrong': !isCorrect && chosen0 && chosen1,
  }
}
</script>

<style scoped>
.answer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);
  padding: 0 var(--sp-4);
}

.answer-btn {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-paper-dark);
  background: white;
  box-shadow: var(--shadow-sm);
  text-align: left;
  cursor: pointer;
  transition: border-color var(--t-fast), background var(--t-fast), transform var(--t-fast);
  min-height: 58px;
}
.answer-btn:hover:not(:disabled) {
  border-color: var(--color-cinnabar);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.answer-btn:active:not(:disabled) { transform: translateY(0); }
.answer-btn:disabled { cursor: not-allowed; opacity: 0.7; }

.opt-index {
  flex-shrink: 0;
  width: 26px; height: 26px;
  border-radius: 50%;
  background: var(--color-paper-dark);
  display: flex; align-items: center; justify-content: center;
  font-weight: 900;
  font-size: 0.75rem;
  color: var(--color-stone);
}

.opt-text {
  font-size: var(--size-option);
  color: var(--color-ink);
  line-height: 1.45;
}

/* 答题揭晓状态 */
.opt-correct {
  border-color: var(--color-jade);
  background: #d5f5e3;
}
.opt-correct .opt-index { background: var(--color-jade); color: white; }

.opt-chosen-p1 {
  border-color: var(--color-cinnabar);
  background: #fde8e8;
}
.opt-chosen-p2 {
  border-color: var(--color-azure);
  background: #e8f0fd;
}
.opt-both-wrong {
  border-color: var(--color-clay);
  background: #fde8d8;
}
</style>
