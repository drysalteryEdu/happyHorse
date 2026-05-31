import { createRouter, createWebHistory } from 'vue-router'
import LobbyView from '@/views/LobbyView.vue'
import GameView from '@/views/GameView.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: LobbyView },
    { path: '/game', component: GameView },
  ],
})
