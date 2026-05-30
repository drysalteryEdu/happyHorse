<template>
  <div class="game-layout">
    <header class="game-header">
      <span class="room-badge">房间 {{ peer.roomId.slice(0, 8) }}</span>
      <h2>汉字桌游</h2>
      <button class="leave-btn" @click="leave">退出</button>
    </header>

    <PlayerStatus />

    <GameBoard />

    <div class="controls">
      <DiceRoller />
    </div>

    <QuestionCard v-if="game.phase === 'answering' || game.phase === 'result'" />

    <!-- 游戏结束 -->
    <div v-if="game.phase === 'finished'" class="winner-overlay">
      <div class="winner-box">
        <div class="trophy">🏆</div>
        <h2>{{ game.winner }} 获胜！</h2>
        <button @click="leave">返回大厅</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { usePeerStore } from '@/stores/peer'
import { useRouter } from 'vue-router'
import PlayerStatus from '@/components/PlayerStatus.vue'
import GameBoard from '@/components/GameBoard.vue'
import DiceRoller from '@/components/DiceRoller.vue'
import QuestionCard from '@/components/QuestionCard.vue'

const game = useGameStore()
const peer = usePeerStore()
const router = useRouter()

function leave() {
  peer.disconnect()
  game.$reset()
  router.push('/')
}
</script>

<style scoped>
.game-layout {
  max-width: 600px;
  margin: 0 auto;
  padding: 12px 8px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--card);
  border: 2px solid var(--border);
  border-radius: var(--radius);
}

h2 { font-size: 18px; color: var(--accent); }

.room-badge {
  font-size: 12px;
  background: #f0e6d3;
  border-radius: 8px;
  padding: 4px 8px;
  color: #888;
  font-family: monospace;
}

.leave-btn {
  background: transparent;
  color: #999;
  padding: 4px 10px;
  font-size: 13px;
  border: 1px solid #ddd;
}

.controls { display: flex; justify-content: center; }

.winner-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.winner-box {
  background: var(--card);
  border-radius: 20px;
  padding: 40px 48px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  box-shadow: 0 8px 40px rgba(0,0,0,0.3);
}

.trophy { font-size: 64px; }
.winner-box h2 { font-size: 28px; color: var(--accent); }
.winner-box button { padding: 12px 32px; font-size: 17px; }
</style>
