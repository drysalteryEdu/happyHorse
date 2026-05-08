<template>
  <div id="app">
    <Transition name="slide-fade" mode="out-in">
      <!-- 大厅 -->
      <GameLobby
        v-if="game.phase === 'idle' || game.phase === 'lobby'"
        key="lobby"
        @start="game.startGame($event)"
        @manage="showManager = true"
      />

      <!-- 字库管理 -->
      <CharacterManager
        v-else-if="showManager"
        key="manager"
        @back="showManager = false"
      />

      <!-- 对战 -->
      <PKBattle
        v-else-if="game.phase === 'battle' || game.phase === 'round_result'"
        key="battle"
      />

      <!-- 最终结果 -->
      <GameResult
        v-else-if="game.phase === 'game_result'"
        key="result"
        :players="game.players"
        :history="game.roundHistory"
        @replay="handleReplay"
        @lobby="game.resetToLobby()"
      />
    </Transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useGameStore } from './stores/game.js'
import GameLobby from './components/GameLobby.vue'
import PKBattle from './components/PKBattle.vue'
import GameResult from './components/GameResult.vue'
import CharacterManager from './components/CharacterManager.vue'

const game = useGameStore()
const showManager = ref(false)

watch(() => game.phase, (p) => {
  if (p === 'battle') showManager.value = false
})

function handleReplay() {
  game.startGame({ ...game.config })
}

game.goLobby()
</script>

<style>
#app {
  min-height: 100vh;
  background: var(--color-paper);
}
</style>
