import { defineStore } from 'pinia'
import { useGameStore } from './game'
import type { PeerMessage, GameAction } from '@/types'

type ConnStatus = 'idle' | 'creating' | 'waiting' | 'connecting' | 'connected' | 'error'

export const usePeerStore = defineStore('peer', {
  state: () => ({
    roomId: '',
    myId: '',
    myName: '',
    isHost: false,
    status: 'idle' as ConnStatus,
    errorMsg: '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _peer: null as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _conn: null as any,
  }),

  actions: {
    async createRoom(name: string, grade: number, semester: 'upper' | 'lower') {
      this.myName = name
      this.isHost = true
      this.status = 'creating'

      const { Peer } = await import('peerjs')
      const peer = new Peer()
      this._peer = peer

      await new Promise<void>((resolve, reject) => {
        peer.on('open', (id) => {
          this.myId = id
          this.roomId = id
          this.status = 'waiting'
          resolve()
        })
        peer.on('error', (err) => {
          this.status = 'error'
          this.errorMsg = String(err)
          reject(err)
        })
      })

      const game = useGameStore()
      await game.loadGradeData(grade, semester)

      // 等待 Guest 连进来
      peer.on('connection', (conn) => {
        this._conn = conn
        conn.on('open', () => {
          this.status = 'connected'
        })
        conn.on('data', (raw) => {
          const msg = raw as PeerMessage
          if (msg.type === 'join') {
            // Guest 加入：初始化游戏并广播状态
            const hostPlayer = { id: this.myId, name: this.myName, isHost: true, position: 0 }
            const guestPlayer = { id: msg.peerId, name: msg.playerName, isHost: false, position: 0 }
            game.initGame(hostPlayer, guestPlayer)
            this._broadcast()
          } else if (msg.type === 'action') {
            // Host 处理 Guest 的操作
            game.handleAction(msg.action, conn.peer)
            this._broadcast()
          }
        })
        conn.on('error', (err) => {
          this.errorMsg = String(err)
        })
      })
    },

    async joinRoom(roomId: string, name: string) {
      this.myName = name
      this.roomId = roomId
      this.isHost = false
      this.status = 'connecting'

      const { Peer } = await import('peerjs')
      const peer = new Peer()
      this._peer = peer

      await new Promise<void>((resolve, reject) => {
        peer.on('open', (id) => {
          this.myId = id
          resolve()
        })
        peer.on('error', (err) => {
          this.status = 'error'
          this.errorMsg = String(err)
          reject(err)
        })
      })

      const conn = peer.connect(roomId, { reliable: true })
      this._conn = conn

      conn.on('open', () => {
        this.status = 'connected'
        // 告知 Host 我的名字和 ID
        this._send({ type: 'join', playerName: name, peerId: this.myId })
      })

      conn.on('data', (raw) => {
        const msg = raw as PeerMessage
        if (msg.type === 'state') {
          const game = useGameStore()
          game.applyRemoteState(msg.payload)
        }
      })

      conn.on('error', (err) => {
        this.status = 'error'
        this.errorMsg = String(err)
      })
    },

    sendAction(action: GameAction) {
      const game = useGameStore()
      if (this.isHost) {
        // Host 本地处理
        game.handleAction(action, this.myId)
        this._broadcast()
      } else {
        // Guest 发送给 Host
        this._send({ type: 'action', action })
      }
    },

    _broadcast() {
      if (!this._conn?.open) return
      const game = useGameStore()
      const { gradeChars: _skip, ...state } = game.$state
      this._send({ type: 'state', payload: state as never })
    },

    _send(msg: PeerMessage) {
      this._conn?.send(msg)
    },

    disconnect() {
      this._conn?.close()
      this._peer?.destroy()
      this.$reset()
    },
  },
})
