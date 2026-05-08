<template>
  <div class="lobby fade-up">
    <header class="lobby-header">
      <h1 class="lobby-title">汉字 PK</h1>
      <p class="lobby-sub">新华字典 · 意义项对战</p>
    </header>

    <div class="lobby-body">
      <!-- 字库设置 -->
      <section class="card">
        <h3 class="card-title">字库设置</h3>
        <GradeSelector v-model:grades="cfg.grades" v-model:tiers="cfg.tiers" />
      </section>

      <!-- 游戏模式 -->
      <section class="card">
        <h3 class="card-title">题型</h3>
        <div class="radio-group">
          <label v-for="m in GAME_MODES" :key="m.value" class="radio-item">
            <input type="radio" name="gameMode" :value="m.value" v-model="cfg.gameMode" />
            <span class="radio-label">
              <strong>{{ m.label }}</strong>
              <small>{{ m.desc }}</small>
            </span>
          </label>
        </div>
      </section>

      <!-- 对战模式 -->
      <section class="card">
        <h3 class="card-title">对战模式</h3>
        <div class="radio-group">
          <label class="radio-item">
            <input type="radio" name="bm" value="hot_seat" v-model="cfg.battleMode" />
            <span class="radio-label">
              <strong>双人热座</strong>
              <small>同一设备，玩家1用 1234 键，玩家2用 7890 键</small>
            </span>
          </label>
          <label class="radio-item">
            <input type="radio" name="bm" value="vs_ai" v-model="cfg.battleMode" />
            <span class="radio-label">
              <strong>单人 vs AI</strong>
              <small>挑战 AI 对手，用鼠标点击作答</small>
            </span>
          </label>
        </div>

        <div v-if="cfg.battleMode === 'vs_ai'" class="ai-difficulty">
          <label class="field-label">AI 难度</label>
          <div class="chip-row">
            <button v-for="d in AI_LEVELS" :key="d.value" class="chip"
                    :class="{ active: cfg.aiDifficulty === d.value }"
                    @click="cfg.aiDifficulty = d.value">
              {{ d.label }}
            </button>
          </div>
        </div>
      </section>

      <!-- 玩家名字 & 局数 -->
      <section class="card">
        <h3 class="card-title">玩家设置</h3>
        <div class="player-names">
          <div class="name-field p1">
            <label>玩家一</label>
            <input v-model="cfg.player1Name" maxlength="8" placeholder="玩家一" />
          </div>
          <span class="vs-badge">VS</span>
          <div class="name-field p2">
            <label>{{ cfg.battleMode === 'vs_ai' ? 'AI' : '玩家二' }}</label>
            <input v-if="cfg.battleMode !== 'vs_ai'" v-model="cfg.player2Name" maxlength="8" placeholder="玩家二" />
            <span v-else class="ai-name-fixed">{{ cfg.player2Name }}</span>
          </div>
        </div>

        <div class="rounds-row">
          <label class="field-label">局数</label>
          <div class="chip-row">
            <button v-for="r in [5,10,20]" :key="r" class="chip"
                    :class="{ active: cfg.totalRounds === r }"
                    @click="cfg.totalRounds = r">{{ r }}轮</button>
          </div>
        </div>

        <div class="rounds-row">
          <label class="field-label">每轮时限</label>
          <div class="chip-row">
            <button v-for="t in [10,15,20]" :key="t" class="chip"
                    :class="{ active: cfg.timePerRound === t }"
                    @click="cfg.timePerRound = t">{{ t }}秒</button>
          </div>
        </div>
      </section>
    </div>

    <div class="lobby-footer">
      <button class="start-btn" @click="handleStart">开始对战</button>
      <button class="manage-btn" @click="emit('manage')">字库管理</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import GradeSelector from './GradeSelector.vue'

const emit = defineEmits(['start', 'manage'])

const GAME_MODES = [
  { value: 'A',     label: '字 → 义',   desc: '看汉字，选正确义项' },
  { value: 'B',     label: '义 → 字',   desc: '看义项，选正确汉字' },
  { value: 'MIXED', label: '混合',      desc: '随机出两种题型' },
]
const AI_LEVELS = [
  { value: 'easy',   label: '简单（60%正确率）' },
  { value: 'medium', label: '普通（75%正确率）' },
  { value: 'hard',   label: '困难（90%正确率）' },
]

const cfg = reactive({
  grades:      [1],
  tiers:       [1, 2],
  gameMode:    'A',
  battleMode:  'hot_seat',
  aiDifficulty:'medium',
  totalRounds:  10,
  timePerRound: 15,
  player1Name:  '玩家一',
  player2Name:  '玩家二',
})

// 切换 vs_ai 时自动改名
watch(() => cfg.battleMode, val => {
  if (val === 'vs_ai') cfg.player2Name = '智能 AI'
  else cfg.player2Name = '玩家二'
})

function handleStart() {
  emit('start', { ...cfg })
}
</script>

<style scoped>
.lobby {
  max-width: 620px;
  margin: 0 auto;
  padding: var(--sp-8) var(--sp-6);
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
}

.lobby-header { text-align: center; }
.lobby-title {
  font-size: clamp(2rem, 6vw, 3.5rem);
  color: var(--color-cinnabar);
  letter-spacing: 0.1em;
}
.lobby-sub { color: var(--color-stone); font-size: 0.9rem; margin-top: var(--sp-1); }

.lobby-body { display: flex; flex-direction: column; gap: var(--sp-4); }

.card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--sp-6);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}
.card-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-stone);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.radio-group { display: flex; flex-direction: column; gap: var(--sp-2); }
.radio-item {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  cursor: pointer;
  padding: var(--sp-3);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-paper-dark);
  transition: border-color var(--t-fast);
}
.radio-item:has(input:checked) { border-color: var(--color-cinnabar); background: #fef9f9; }
.radio-item input { margin-top: 3px; accent-color: var(--color-cinnabar); }
.radio-label { display: flex; flex-direction: column; gap: 2px; }
.radio-label strong { font-size: 0.9rem; color: var(--color-ink); }
.radio-label small  { font-size: 0.78rem; color: var(--color-stone); }

.ai-difficulty { display: flex; flex-direction: column; gap: var(--sp-2); }
.field-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-stone);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.chip-row { display: flex; flex-wrap: wrap; gap: var(--sp-2); }
.chip {
  padding: var(--sp-1) var(--sp-4);
  border-radius: 20px;
  border: 2px solid var(--color-paper-dark);
  background: white;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all var(--t-fast);
  color: var(--color-stone);
}
.chip:hover  { border-color: var(--color-cinnabar); color: var(--color-cinnabar); }
.chip.active { border-color: var(--color-cinnabar); background: var(--color-cinnabar); color: white; }

.player-names {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
}
.name-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}
.name-field label { font-size: 0.78rem; font-weight: 700; }
.name-field.p1 label { color: var(--color-cinnabar); }
.name-field.p2 label { color: var(--color-azure); }
.name-field input {
  border: 2px solid var(--color-paper-dark);
  border-radius: var(--radius-sm);
  padding: var(--sp-2) var(--sp-3);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color var(--t-fast);
}
.name-field input:focus { border-color: var(--color-cinnabar); }
.ai-name-fixed {
  font-size: 0.9rem;
  color: var(--color-azure);
  font-weight: 700;
  padding: var(--sp-2) var(--sp-3);
  border: 2px solid var(--color-paper-dark);
  border-radius: var(--radius-sm);
  background: var(--color-paper);
}
.vs-badge {
  font-weight: 900;
  color: var(--color-stone);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.rounds-row { display: flex; flex-direction: column; gap: var(--sp-2); }

.lobby-footer {
  display: flex;
  gap: var(--sp-4);
  justify-content: center;
}
.start-btn {
  padding: var(--sp-4) var(--sp-12);
  background: var(--color-cinnabar);
  color: white;
  font-size: 1.1rem;
  font-weight: 900;
  font-family: var(--font-hanzi);
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  letter-spacing: 0.1em;
  transition: all var(--t-fast);
}
.start-btn:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(192,57,43,0.35); }
.manage-btn {
  padding: var(--sp-4) var(--sp-6);
  background: white;
  color: var(--color-stone);
  font-size: 0.9rem;
  font-weight: 700;
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-paper-dark);
  cursor: pointer;
  transition: border-color var(--t-fast);
}
.manage-btn:hover { border-color: var(--color-stone); }
</style>
