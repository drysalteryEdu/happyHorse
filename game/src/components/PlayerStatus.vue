<template>
  <div class="players">
    <div
      v-for="(player, idx) in game.players"
      :key="player.id"
      class="player-card"
      :class="{ active: game.currentPlayerIdx === idx }"
    >
      <div class="avatar" :class="player.isHost ? 'host' : 'guest'">
        {{ player.name.charAt(0) }}
      </div>
      <div class="info">
        <span class="pname">{{ player.name }}</span>
        <span class="pos">格 {{ player.position }} / {{ BOARD_SIZE - 1 }}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${(player.position / (BOARD_SIZE - 1)) * 100}%` }"></div>
      </div>
      <span v-if="game.currentPlayerIdx === idx" class="turn-chip">当前</span>
    </div>

    <!-- 连线状态 -->
    <div class="conn-badge" :class="peer.status">
      <span class="dot"></span>
      {{ statusLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { usePeerStore } from '@/stores/peer'

const game = useGameStore()
const peer = usePeerStore()
const BOARD_SIZE = 30

const statusLabel = computed(() => ({
  idle: '未连接', creating: '创建中', waiting: '等待中',
  connecting: '连接中', connected: '已连接', error: '连接错误',
}[peer.status]))
</script>

<style scoped>
.players {
  display: flex;
  gap: 10px;
  align-items: stretch;
  position: relative;
}

.player-card {
  flex: 1;
  background: var(--card);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.2s, box-shadow 0.2s;
  position: relative;
}

.player-card.active {
  border-color: #e67e22;
  box-shadow: 0 0 0 3px rgba(230,126,34,0.2);
}

.avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; color: #fff;
  align-self: flex-start;
}
.host  { background: #e74c3c; }
.guest { background: #2980b9; }

.info { display: flex; justify-content: space-between; align-items: baseline; }
.pname { font-weight: 700; font-size: 15px; }
.pos { font-size: 12px; color: #999; }

.progress-bar {
  height: 6px; background: #eee; border-radius: 3px; overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e67e22, #e74c3c);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.turn-chip {
  position: absolute;
  top: 8px; right: 8px;
  font-size: 10px;
  background: #e67e22;
  color: #fff;
  border-radius: 6px;
  padding: 2px 6px;
  font-weight: 700;
}

.conn-badge {
  position: absolute;
  top: -8px; left: 50%; transform: translateX(-50%);
  font-size: 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 2px 8px;
  display: flex; align-items: center; gap: 4px;
  white-space: nowrap;
  color: #666;
}
.dot {
  width: 6px; height: 6px; border-radius: 50%; background: #ccc;
}
.connected .dot { background: #27ae60; }
.connecting .dot, .creating .dot, .waiting .dot { background: #f39c12; animation: blink 1s infinite; }
.error .dot { background: #e74c3c; }

@keyframes blink { 50% { opacity: 0.2; } }
</style>
