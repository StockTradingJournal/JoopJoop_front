import { useState, useEffect, useCallback } from 'react';
import { gameSocket } from '../lib/gameSocket';
import { GameState, ItemType, PeekResult } from '../lib/socket-types';
import { HomeScreen } from './components/HomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { ItemSelectionScreen } from './components/ItemSelectionScreen';
import { GameContainer } from './components/GameContainer';
import { ResultScreen } from './components/ResultScreen';

type Screen = 'home' | 'lobby' | 'item_selection' | 'game' | 'result';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [roomCode, setRoomCode] = useState('');
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [gameState, setGameState] = useState<GameState | null>(null);
  // Peek result received this tick
  const [activePeek, setActivePeek] = useState<PeekResult | null>(null);

  useEffect(() => {
    gameSocket.connect();

    const handleRoomState = (state: GameState) => {
      setGameState(state);

      const socketId = gameSocket.getSocket()?.id;
      if (socketId) setCurrentPlayerId(socketId);

      // Handle peek result (private)
      if (state.peekResult) {
        setActivePeek(state.peekResult);
        setTimeout(() => setActivePeek(null), 4000);
      }

      // Screen transitions
      if (state.phase === 'game_over') {
        setCurrentScreen('result');
      } else if (state.phase === 'item_selection') {
        setCurrentScreen('item_selection');
      } else if (state.gameState === 'playing') {
        setCurrentScreen('game');
      }
    };

    const handleRoomDestroyed = (data: { message: string }) => {
      alert(data.message || '방이 파괴되었습니다.');
      resetToHome();
    };

    gameSocket.onRoomState(handleRoomState);
    gameSocket.onRoomDestroyed(handleRoomDestroyed);

    return () => {
      gameSocket.offRoomState(handleRoomState);
      gameSocket.offRoomDestroyed(handleRoomDestroyed);
    };
  }, []);

  const resetToHome = useCallback(() => {
    setCurrentScreen('home');
    setRoomCode('');
    setCurrentPlayerId('');
    setGameState(null);
    setActivePeek(null);
  }, []);

  const handleCreateRoom = async (nickname: string) => {
    if (!gameSocket.isSocketConnected()) {
      alert('서버에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    try {
      const { roomId } = await gameSocket.createRoom(nickname);
      setRoomCode(roomId);
      setCurrentScreen('lobby');
    } catch {
      alert('방 생성에 실패했습니다.');
    }
  };

  const handleJoinRoom = async (nickname: string, code: string) => {
    if (!gameSocket.isSocketConnected()) {
      alert('서버에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    try {
      await gameSocket.joinRoom(code, nickname);
      setRoomCode(code);
      setCurrentScreen('lobby');
    } catch {
      alert('방 참가에 실패했습니다. 방 코드를 확인해주세요.');
    }
  };

  const handleReady = () => {
    const me = gameState?.players.find((p) => p.id === currentPlayerId);
    gameSocket.setPlayerReady(!me?.isReady);
  };

  const handleStartGame = () => gameSocket.startGame();
  const handleBid = (amount: number) => gameSocket.placeBid(amount);
  const handlePass = () => gameSocket.passTurn();
  const handlePlayCard = (cardId: number) => gameSocket.playCard(cardId);
  const handleSelectItem = (item: ItemType) => gameSocket.selectItem(item);
  const handleUseItemReroll = () => gameSocket.useItemReroll();
  const handleUseItemPeek = (targetId: string) => gameSocket.useItemPeek(targetId);
  const handleUseItemReverse = () => gameSocket.useItemReverse();

  const handleLeaveRoom = () => {
    gameSocket.leaveRoom();
    resetToHome();
  };

  return (
    <div className="size-full min-h-screen">
      {currentScreen === 'home' && (
        <HomeScreen
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )}

      {currentScreen === 'lobby' && gameState && (
        <LobbyScreen
          roomCode={roomCode}
          players={gameState.players}
          currentPlayerId={currentPlayerId}
          onReady={handleReady}
          onStartGame={handleStartGame}
          onLeaveRoom={handleLeaveRoom}
        />
      )}

      {currentScreen === 'item_selection' && gameState && (
        <ItemSelectionScreen
          players={gameState.players}
          currentPlayerId={currentPlayerId}
          playerItems={gameState.playerItems}
          onSelectItem={handleSelectItem}
        />
      )}

      {currentScreen === 'game' && gameState && (
        <GameContainer
          gameState={gameState}
          currentPlayerId={currentPlayerId}
          activePeek={activePeek}
          onBid={handleBid}
          onPass={handlePass}
          onPlayCard={handlePlayCard}
          onUseItemReroll={handleUseItemReroll}
          onUseItemPeek={handleUseItemPeek}
          onUseItemReverse={handleUseItemReverse}
        />
      )}

      {currentScreen === 'result' && gameState?.finalRankings && (
        <ResultScreen
          rankings={gameState.finalRankings}
          currentPlayerId={currentPlayerId}
          onBackToHome={handleLeaveRoom}
        />
      )}
    </div>
  );
}
