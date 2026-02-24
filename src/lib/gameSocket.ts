import { io, Socket } from 'socket.io-client';
import { GameState, ItemType } from './socket-types';

const BACKEND_URL = 'https://joopjoop-backend.onrender.com/';

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

  leaveRoom() {
    this.socket?.emit('leave_room', {});
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
