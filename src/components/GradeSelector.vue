<template>
  <div class="grade-selector">
    <div class="field-group">
      <label class="field-label">年级</label>
      <div class="chip-row">
        <button
          v-for="g in availableGrades"
          :key="g"
          class="chip"
          :class="{ active: modelGrades.includes(g) }"
          @click="toggleGrade(g)"
        >{{ g }}年级</button>
        <span v-if="availableGrades.length === 0" class="hint-text">（暂无更多年级字库）</span>
      </div>
    </div>

    <div class="field-group">
      <label class="field-label">字类</label>
      <div class="chip-row">
        <button class="chip" :class="{ active: modelTiers.includes(1) }" @click="toggleTier(1)">
          一类字（读写）
        </button>
        <button class="chip" :class="{ active: modelTiers.includes(2) }" @click="toggleTier(2)">
          二类字（认读）
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { AVAILABLE_GRADES } from '../data/index.js'

const props = defineProps({
  grades: { type: Array, default: () => [1] },
  tiers:  { type: Array, default: () => [1, 2] },
})
const emit = defineEmits(['update:grades', 'update:tiers'])

const availableGrades = AVAILABLE_GRADES

const modelGrades = computed({
  get: () => props.grades,
  set: v => emit('update:grades', v),
})
const modelTiers = computed({
  get: () => props.tiers,
  set: v => emit('update:tiers', v),
})

function toggleGrade(g) {
  const cur = [...modelGrades.value]
  const idx = cur.indexOf(g)
  if (idx >= 0) {
    if (cur.length === 1) return  // 至少选一个
    cur.splice(idx, 1)
  } else {
    cur.push(g)
    cur.sort()
  }
  modelGrades.value = cur
}

function toggleTier(t) {
  const cur = [...modelTiers.value]
  const idx = cur.indexOf(t)
  if (idx >= 0) {
    if (cur.length === 1) return
    cur.splice(idx, 1)
  } else {
    cur.push(t)
    cur.sort()
  }
  modelTiers.value = cur
}
</script>

<style scoped>
.grade-selector { display: flex; flex-direction: column; gap: var(--sp-4); }

.field-group { display: flex; flex-direction: column; gap: var(--sp-2); }

.field-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-stone);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.chip-row { display: flex; flex-wrap: wrap; gap: var(--sp-2); }

.chip {
  padding: var(--sp-2) var(--sp-4);
  border-radius: 20px;
  border: 2px solid var(--color-paper-dark);
  background: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--t-fast);
  color: var(--color-stone);
}
.chip:hover { border-color: var(--color-cinnabar); color: var(--color-cinnabar); }
.chip.active {
  border-color: var(--color-cinnabar);
  background: var(--color-cinnabar);
  color: white;
}

.hint-text { font-size: 0.8rem; color: var(--color-stone); font-style: italic; }
</style>
