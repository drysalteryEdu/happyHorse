<template>
  <div class="battle-wrap">
    <!-- 顶部状态栏 -->
    <header class="battle-header">
      <div class="header-player p1" :style="{ '--pc': game.players[0].color }">
        <span class="hp-name">{{ game.players[0].name }}</span>
        <span class="hp-score score-pop-trigger" :class="{ 'score-pop': scorePop[0] }">
          {{ game.players[0].score }}
        </span>
      </div>

      <div class="round-info">
        <div class="round-label">第 {{ game.currentRound }} / {{ game.config.totalRounds }} 轮</div>
        <CountdownTimer
          :seconds="game.config.timePerRound"
          :running="isAnswering"
          @expire="game.onTimerExpire()"
        />
      </div>

      <div class="header-player p2" :style="{ '--pc': game.players[1].color }">
        <span class="hp-score score-pop-trigger" :class="{ 'score-pop': scorePop[1] }">
          {{ game.players[1].score }}
        </span>
        <span class="hp-name">{{ game.players[1].name }}</span>
      </div>
    </header>

    <!-- 题目区 -->
    <main class="battle-main" v-if="game.currentQuestion">
      <CharacterDisplay :question="game.currentQuestion" />
      <AnswerOptions
        :question="game.currentQuestion"
        :answers="game.roundAnswers"
        :revealed="game.phase === 'round_result'"
        :disabled="!isAnswering"
        @choose="handleChoose"
      />
    </main>

    <!-- 玩家面板（热座模式显示按键提示） -->
    <footer class="battle-footer">
      <PlayerPanel
        :player="game.players[0]"
        side="left"
        :answer="game.roundAnswers[0]"
        :show-keys="game.isHotSeat"
      />
      <div class="key-legend" v-if="game.isHotSeat">
        <div class="kl-title">按键说明</div>
        <div class="kl-row">
          <span class="kl-p1">玩家一：1 2 3 4</span>
          <span class="kl-sep">｜</span>
          <span class="kl-p2">玩家二：7 8 9 0</span>
        </div>
      </div>
      <div v-else class="ai-status">
        <span v-if="!game.roundAnswers[1]" class="ai-thinking">AI 思考中…</span>
        <span v-else>AI 已作答</span>
      </div>
      <PlayerPanel
        :player="game.players[1]"
        side="right"
        :answer="game.roundAnswers[1]"
        :show-keys="game.isHotSeat"
      />
    </footer>

    <!-- 轮次结果覆盖层 -->
    <Transition name="fade">
      <RoundResult
        v-if="game.phase === 'round_result' && game.currentQuestion"
        :question="game.currentQuestion"
        :answers="game.roundAnswers"
        :players="game.players"
      />
    </Transition>

    <!-- 返回按钮 -->
    <button class="quit-btn" @click="game.resetToLobby()">✕ 退出</button>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'
import { useGameStore } from '../stores/game.js'
import CountdownTimer from './CountdownTimer.vue'
import CharacterDisplay from './CharacterDisplay.vue'
import AnswerOptions from './AnswerOptions.vue'
import PlayerPanel from './PlayerPanel.vue'
import RoundResult from './RoundResult.vue'

const game = useGameStore()

const isAnswering = computed(() => game.phase === 'battle')

// 分数弹出动画
const scorePop = ref([false, false])
watch(
  () => game.players.map(p => p.score),
  (newScores, oldScores) => {
    newScores.forEach((s, i) => {
      if (s !== oldScores?.[i]) {
        scorePop.value[i] = true
        setTimeout(() => { scorePop.value[i] = false }, 600)
      }
    })
  }
)

// 鼠标点击选项（VS AI 模式中玩家0用鼠标）
function handleChoose(optionIdx) {
  if (!isAnswering.value) return
  if (game.isVsAI) {
    game.submitAnswer(0, optionIdx)
  }
}

// 键盘监听（热座模式）
const KEY_MAP = {
  '1': { p: 0, c: 0 }, '2': { p: 0, c: 1 }, '3': { p: 0, c: 2 }, '4': { p: 0, c: 3 },
  '7': { p: 1, c: 0 }, '8': { p: 1, c: 1 }, '9': { p: 1, c: 2 }, '0': { p: 1, c: 3 },
}
function onKey(e) {
  if (!game.isHotSeat || !isAnswering.value) return
  const mapped = KEY_MAP[e.key]
  if (mapped) game.submitAnswer(mapped.p, mapped.c)
}

import { onMounted, onUnmounted } from 'vue'
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.battle-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 860px;
  margin: 0 auto;
  padding: var(--sp-4);
  gap: var(--sp-4);
}

/* 顶部状态栏 */
.battle-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--sp-4);
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--sp-3) var(--sp-4);
  box-shadow: var(--shadow-sm);
}
.header-player {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.header-player.p2 { justify-content: flex-end; }
.hp-name { font-weight: 700; font-size: 0.9rem; color: var(--pc); }
.hp-score {
  font-size: 1.6rem;
  font-weight: 900;
  font-family: var(--font-hanzi);
  color: var(--color-ink);
}
.score-pop { animation: score-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }

.round-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  min-width: 180px;
}
.round-label { font-size: 0.78rem; color: var(--color-stone); font-weight: 700; }

/* 题目区 */
.battle-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--sp-4);
  box-shadow: var(--shadow-card);
}

/* 底部面板 */
.battle-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
}
.key-legend {
  text-align: center;
  font-size: 0.78rem;
  color: var(--color-stone);
}
.kl-title { font-weight: 700; margin-bottom: var(--sp-1); }
.kl-row { display: flex; gap: var(--sp-2); align-items: center; }
.kl-p1 { color: var(--color-cinnabar); font-weight: 700; }
.kl-p2 { color: var(--color-azure); font-weight: 700; }

.ai-status {
  font-size: 0.82rem;
  color: var(--color-stone);
  text-align: center;
  min-width: 80px;
}
.ai-thinking { animation: pulse-red 1.2s ease-in-out infinite; }

/* 覆盖层 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 退出按钮 */
.quit-btn {
  position: fixed;
  top: var(--sp-4);
  right: var(--sp-4);
  padding: var(--sp-1) var(--sp-3);
  font-size: 0.78rem;
  color: var(--color-stone);
  background: white;
  border: 1px solid var(--color-paper-dark);
  border-radius: var(--radius-sm);
  cursor: pointer;
  z-index: 20;
  transition: color var(--t-fast), border-color var(--t-fast);
}
.quit-btn:hover { color: var(--color-cinnabar); border-color: var(--color-cinnabar); }
</style>
