import { io, Socket } from 'socket.io-client';
import { GameState, ItemType } from './socket-types';

// const BACKEND_URL = 'https://joopjoop-backend.onrender.com/';
const BACKEND_URL = 'http://localhost:8000/';

class GameSocket {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;
    this.socket = io(BACKEND_URL, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
    });
    this.socket.on('connect', () => console.log('✅ Socket connected:', this.socket?.id));
    this.socket.on('disconnect', () => console.log('❌ Socket disconnected'));
    this.socket.on('connect_error', (e) => console.error('Socket error:', e));
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isSocketConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ── Room management ──────────────────────────────────────

  createRoom(nickname: string): Promise<{ roomId: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Not connected'));
      this.socket.emit('create_room', { nickname });
      const onCreated = (data: { roomId: string }) => {
        this.socket?.off('room:error', onError);
        resolve(data);
      };
      const onError = (err: { message: string }) => {
        this.socket?.off('room:created', onCreated);
        reject(new Error(err.message));
      };
      this.socket.once('room:created', onCreated);
      this.socket.once('room:error', onError);
    });
  }

  joinRoom(roomId: string, nickname: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Not connected'));
      this.socket.emit('join_room', { roomId, nickname });
      const onJoined = () => {
        this.socket?.off('room:error', onError);
        resolve();
      };
      const onError = (err: { message: string }) => {
        this.socket?.off('room:joined', onJoined);
        reject(new Error(err.message));
      };
      this.socket.once('room:joined', onJoined);
      this.socket.once('room:error', onError);
    });
  }

  setPlayerReady(ready: boolean) {
    this.socket?.emit('player_ready', { ready });
  }

  startGame() {
    this.socket?.emit('start_game', {});
  }

  addBot() {
    this.socket?.emit('add_bot', {});
  }

  leaveRoom() {
    this.socket?.emit('leave_room', {});
  }

  /** Reset room from game over to lobby (same players). Fails if not in game over. */
  returnToLobby(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Not connected'));
      const onOk = () => {
        this.socket?.off('room:error', onErr);
        resolve();
      };
      const onErr = (err: { code?: string; message?: string }) => {
        if (err?.code !== 'RETURN_LOBBY_FAILED') return;
        this.socket?.off('room:state', onOk);
        reject(new Error(err?.message ?? '대기실로 돌아갈 수 없습니다.'));
      };
      // Register before emit — server may broadcast immediately
      this.socket.once('room:state', onOk);
      this.socket.on('room:error', onErr);
      this.socket.emit('return_to_lobby', {});
    });
  }

  /** Quick match queue (3–6 players). Server broadcasts room:state when matched. */
  joinMatchQueue(playerCount: number, nickname: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Not connected'));
      this.socket.emit('join_match_queue', { playerCount, nickname });
      const onJoined = () => {
        this.socket?.off('match_queue:error', onErr);
        resolve();
      };
      const onErr = (err: { message?: string }) => {
        this.socket?.off('match_queue:joined', onJoined);
        reject(new Error(err?.message ?? '매칭 대기 실패'));
      };
      this.socket.once('match_queue:joined', onJoined);
      this.socket.once('match_queue:error', onErr);
    });
  }

  leaveMatchQueue(): void {
    this.socket?.emit('leave_match_queue', {});
  }

  // ── Phase 1 actions ──────────────────────────────────────

  placeBid(amount: number) {
    this.socket?.emit('place_bid', { amount });
  }

  passTurn() {
    this.socket?.emit('pass_turn', {});
  }

  // ── Phase 2 actions ──────────────────────────────────────

  playCard(cardId: number) {
    this.socket?.emit('play_card', { card_id: cardId });
  }

  // ── Item actions ─────────────────────────────────────────

  selectItem(item: ItemType) {
    this.socket?.emit('select_item', { item });
  }

  useItemReroll() {
    this.socket?.emit('use_item_reroll', {});
  }

  useItemPeek(targetId: string) {
    this.socket?.emit('use_item_peek', { targetId });
  }

  useItemReverse() {
    this.socket?.emit('use_item_reverse', {});
  }

  // ── Chat ─────────────────────────────────────────────────

  sendChatMessage(message: string) {
    this.socket?.emit('chat_message', { message });
  }

  // ── Listeners ────────────────────────────────────────────

  onRoomState(handler: (state: GameState) => void) {
    this.socket?.on('room:state', handler);
  }

  offRoomState(handler: (state: GameState) => void) {
    this.socket?.off('room:state', handler);
  }

  onRoomDestroyed(handler: (data: { message: string }) => void) {
    this.socket?.on('room:destroyed', handler);
  }

  offRoomDestroyed(handler: (data: { message: string }) => void) {
    this.socket?.off('room:destroyed', handler);
  }

  onChatMessage(handler: (data: { playerId: string; nickname: string; message: string; timestamp: number }) => void) {
    this.socket?.on('chat:message', handler);
  }

  offChatMessage(handler: (data: { playerId: string; nickname: string; message: string; timestamp: number }) => void) {
    this.socket?.off('chat:message', handler);
  }

  onRoomError(handler: (data: { code: string; message: string }) => void) {
    this.socket?.on('room:error', handler);
  }

  offRoomError(handler: (data: { code: string; message: string }) => void) {
    this.socket?.off('room:error', handler);
  }
}

export const gameSocket = new GameSocket();
