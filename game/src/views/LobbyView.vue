<template>
  <div class="lobby">
    <div class="title-box">
      <div class="logo">🎲</div>
      <h1>汉字桌游</h1>
      <p class="subtitle">小学语文 · 趣味棋盘游戏</p>
    </div>

    <div class="card form-card">
      <label>
        <span>你的名字</span>
        <input
          v-model="name"
          placeholder="请输入玩家姓名"
          maxlength="8"
          data-testid="name-input"
        />
      </label>

      <label>
        <span>年级 / 册</span>
        <div class="grade-row">
          <select v-model="grade" data-testid="grade-select">
            <option v-for="g in 6" :key="g" :value="g">{{ g }}年级</option>
          </select>
          <select v-model="semester" data-testid="semester-select">
            <option value="upper">上册</option>
            <option value="lower">下册</option>
          </select>
        </div>
      </label>
    </div>

    <div class="card action-card">
      <div class="create-section">
        <button
          :disabled="!name.trim() || loading"
          data-testid="create-btn"
          @click="handleCreate"
        >
          {{ loading && isCreating ? '创建中…' : '🏠 创建房间' }}
        </button>
        <p class="hint">成为房主，获得房间号后分享给朋友</p>
      </div>

      <div class="divider">— 或 —</div>

      <div class="join-section">
        <div class="join-row">
          <input
            v-model="joinId"
            placeholder="输入房间号"
            data-testid="room-id-input"
            @keyup.enter="handleJoin"
          />
          <button
            :disabled="!name.trim() || !joinId.trim() || loading"
            data-testid="join-btn"
            @click="handleJoin"
          >
            {{ loading && !isCreating ? '加入中…' : '🚪 加入房间' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 等待 Guest 加入（Host 侧） -->
    <div v-if="peer.status === 'waiting'" class="card waiting-card">
      <p>等待朋友加入…</p>
      <div class="room-id-box">
        <span>房间号</span>
        <code data-testid="room-id">{{ peer.roomId }}</code>
        <button class="copy-btn" @click="copyId">📋 复制</button>
      </div>
    </div>

    <p v-if="peer.errorMsg" class="error">{{ peer.errorMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePeerStore } from '@/stores/peer'
import { useGameStore } from '@/stores/game'
import { watch } from 'vue'

const router = useRouter()
const peer = usePeerStore()
const game = useGameStore()

const name = ref('')
const grade = ref(1)
const semester = ref<'upper' | 'lower'>('lower')
const joinId = ref('')
const loading = ref(false)
const isCreating = ref(false)

async function handleCreate() {
  if (!name.value.trim()) return
  loading.value = true
  isCreating.value = true
  try {
    await peer.createRoom(name.value.trim(), grade.value, semester.value)
  } catch {
    loading.value = false
  }
}

async function handleJoin() {
  if (!name.value.trim() || !joinId.value.trim()) return
  loading.value = true
  isCreating.value = false
  try {
    await peer.joinRoom(joinId.value.trim(), name.value.trim())
  } catch {
    loading.value = false
  }
}

function copyId() {
  navigator.clipboard.writeText(peer.roomId)
}

// 当游戏状态进入 rolling 阶段（Host 初始化或 Guest 收到状态）→ 跳转游戏页
watch(() => game.phase, (phase) => {
  if (phase === 'rolling' || phase === 'answering') {
    router.push('/game')
  }
})
</script>

<style scoped>
.lobby {
  max-width: 480px;
  margin: 0 auto;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title-box { text-align: center; }
.logo { font-size: 56px; line-height: 1; }
h1 { font-size: 32px; color: var(--accent); margin: 8px 0 4px; }
.subtitle { color: #888; font-size: 14px; }

.form-card { display: flex; flex-direction: column; gap: 16px; }
.form-card label { display: flex; flex-direction: column; gap: 6px; font-weight: 600; font-size: 14px; }
.grade-row { display: flex; gap: 8px; }
.grade-row select {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  font-size: 15px;
  font-family: inherit;
  background: #fff;
  cursor: pointer;
}

.action-card { display: flex; flex-direction: column; gap: 16px; }
.create-section { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
.create-section button { width: 100%; justify-content: center; padding: 14px; font-size: 17px; }
.hint { font-size: 13px; color: #999; }
.divider { text-align: center; color: #bbb; font-size: 13px; }
.join-row { display: flex; gap: 8px; }
.join-row input { flex: 1; }

.waiting-card { text-align: center; }
.waiting-card p { font-size: 15px; color: #666; margin-bottom: 12px; }
.room-id-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
  justify-content: center;
}
.room-id-box span { font-size: 13px; color: #888; }
.room-id-box code {
  font-size: 15px;
  font-family: monospace;
  font-weight: 700;
  color: var(--accent);
  word-break: break-all;
}
.copy-btn {
  background: transparent;
  color: var(--btn);
  padding: 4px 8px;
  font-size: 13px;
}

.error { color: #e74c3c; font-size: 14px; text-align: center; }
</style>
