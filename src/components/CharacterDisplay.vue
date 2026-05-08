<template>
  <div class="char-display" :class="{ 'mode-b': question.mode === 'B' }">
    <template v-if="question.mode === 'A'">
      <div class="hanzi char-drop" :key="question.stem">{{ question.stem }}</div>
      <div class="pinyin">{{ question.stemPinyin }}</div>
    </template>
    <template v-else>
      <div class="meaning-stem char-drop" :key="question.stem">{{ question.stem }}</div>
      <div class="mode-label">（选出对应汉字）</div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  question: { type: Object, required: true },
})
</script>

<style scoped>
.char-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  padding: var(--sp-8) var(--sp-6);
  min-height: 220px;
}

.hanzi {
  font-family: var(--font-hanzi);
  font-size: var(--size-display);
  color: var(--color-ink);
  line-height: 1;
  text-shadow: 2px 3px 6px rgba(26,16,8,0.15);
  user-select: none;
}

.pinyin {
  font-size: 1.4rem;
  color: var(--color-stone);
  font-family: var(--font-ui);
  letter-spacing: 0.08em;
}

.meaning-stem {
  font-family: var(--font-ui);
  font-size: var(--size-meaning);
  color: var(--color-ink);
  max-width: 360px;
  text-align: center;
  line-height: 1.7;
  background: white;
  border: 2px solid var(--color-stone);
  border-radius: var(--radius-md);
  padding: var(--sp-4) var(--sp-6);
  box-shadow: var(--shadow-card);
}

.mode-label {
  font-size: 0.8rem;
  color: var(--color-stone);
}
</style>
