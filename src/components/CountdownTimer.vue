<template>
  <div class="timer-wrap" :class="{ 'timer-low': progress < 0.25 }">
    <div class="timer-bar" :style="{ width: (progress * 100) + '%' }"></div>
    <span class="timer-text">{{ secsLeft }}s</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  seconds: { type: Number, default: 15 },
  running: { type: Boolean, default: false },
})
const emit = defineEmits(['expire'])

const progress  = ref(1)
const secsLeft  = ref(props.seconds)

let rafId     = null
let startAt   = null
let duration  = null
let expired   = false

function startTimer() {
  stopTimer()
  expired  = false
  startAt  = performance.now()
  duration = props.seconds * 1000
  progress.value = 1
  secsLeft.value = props.seconds
  rafId = requestAnimationFrame(tick)
}

function stopTimer() {
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
}

function tick(now) {
  const elapsed = now - startAt
  const remaining = Math.max(0, duration - elapsed)
  progress.value  = remaining / duration
  secsLeft.value  = Math.ceil(remaining / 1000)

  if (remaining <= 0) {
    if (!expired) { expired = true; emit('expire') }
    return
  }
  rafId = requestAnimationFrame(tick)
}

watch(() => props.running, (val) => {
  if (val) startTimer()
  else stopTimer()
}, { immediate: true })

watch(() => props.seconds, () => {
  if (props.running) startTimer()
})

onUnmounted(stopTimer)
</script>

<style scoped>
.timer-wrap {
  position: relative;
  height: 10px;
  background: var(--color-paper-dark);
  border-radius: 5px;
  overflow: hidden;
}

.timer-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--color-jade) 0%, var(--color-gold) 60%, var(--color-cinnabar) 100%);
  border-radius: 5px;
  transition: width 0.1s linear;
  transform-origin: left;
}

.timer-text {
  position: absolute;
  right: var(--sp-2);
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-stone);
  line-height: 1;
}

.timer-low .timer-bar {
  background: var(--color-cinnabar);
  animation: pulse-red 0.6s ease-in-out infinite;
}
.timer-low .timer-text { color: var(--color-cinnabar); }
</style>
