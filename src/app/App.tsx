import { useState, useEffect, useCallback, useRef } from 'react';
import { Music2, Volume2, VolumeX, SlidersHorizontal } from 'lucide-react';
import { gameSocket } from '../lib/gameSocket';
import { GameState, ItemType, PeekResult, LastPassEvent, RoundResult } from '../lib/socket-types';
import { playBGM, pauseBGM, playPoint, playDingDong, isBGMMuted, isSFXMuted, setBGMMuted, setSFXMuted } from '../lib/audio';
import { HomeScreen } from './components/HomeScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { ItemSelectionScreen } from './components/ItemSelectionScreen';
import { GameContainer } from './components/GameContainer';
import { ResultScreen } from './components/ResultScreen';

type Screen = 'home' | 'lobby' | 'item_selection' | 'game' | 'result';

// ── Dev mode: ?devPhase=2 로 Phase2 화면 바로 테스트 ──────────────────────────
const DEV_PHASE2_MOCK_ID = 'dev-player-1';

const DEV_NICKNAMES = ['테스트유저', '상대1', '상대2', '상대3', '상대4', '상대5'];
const DEV_ITEM_POOL: Array<'peek' | 'reroll' | null> = ['peek', 'reroll', null, 'reroll', 'peek', null];
const DEV_PROPERTIES_POOL = [
  [5, 12, 20, 27],
  [8, 15],
  [2, 9, 18],
  [3, 11, 24],
  [6, 14, 21, 28],
  [1, 7, 16, 23],
];
const DEV_REAL_ESTATE_POOL = [[3, 7], [10], [], [5], [1, 8], [2]];

function buildDevState(playerCount: number, phase2Round = 1): GameState {
  const clampedCount = Math.max(2, Math.min(6, playerCount));
  const players = Array.from({ length: clampedCount }, (_, i) => ({
    id: i === 0 ? DEV_PHASE2_MOCK_ID : `dev-player-${i + 1}`,
    nickname: DEV_NICKNAMES[i],
    avatar: '',
    isReady: true,
    isHost: i === 0,
    coins: i === 0 ? 12000 : -1,
    currentBid: 0,
    hasPassed: false,
    isCurrentTurn: i === 0,
    properties: DEV_PROPERTIES_POOL[i] ?? [],
    propertyCount: (DEV_PROPERTIES_POOL[i] ?? []).length,
    realEstateCards: DEV_REAL_ESTATE_POOL[i] ?? [],
    realEstateCount: (DEV_REAL_ESTATE_POOL[i] ?? []).length,
    selectedProperty: null,
    hasSelected: false,
  }));

  // 부동산 카드 수 = 플레이어 수 (실제 게임 룰)
  const allRealEstate = [11, 14, 9, 6, 13, 4, 12, 8, 15, 7];
  const currentRealEstateCards = allRealEstate.slice(0, clampedCount);

  const playerItems: GameState['playerItems'] = {};
  players.forEach((p, i) => {
    playerItems[p.id] = { item: DEV_ITEM_POOL[i] ?? null, used: false };
  });

  return {
    roomId: 'DEV',
    gameState: 'playing',
    phase: 'phase2_playing',
    players,
    currentProperties: [],
    currentRealEstateCards,
    currentBid: 0,
    currentHighBidder: null,
    currentTurn: DEV_PHASE2_MOCK_ID,
    roundNumber: 3,
    phase2RoundNumber: phase2Round,
    allPlayersSelected: false,
    playerItems,
    reverseUsedThisRound: false,
    turnDirection: 1,
    mustBidPlayer: null,
    turnStartTime: Date.now() / 1000,
    phase2StartTime: Date.now() / 1000,
    turnTimeout: 30,
    phase2Timeout: 30,
  };
}

const isDevPhase2 = new URLSearchParams(window.location.search).get('devPhase') === '2';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(isDevPhase2 ? 'game' : 'home');
  const [roomCode, setRoomCode] = useState('');
  const [currentPlayerId, setCurrentPlayerId] = useState(isDevPhase2 ? DEV_PHASE2_MOCK_ID : '');
  const [gameState, setGameState] = useState<GameState | null>(isDevPhase2 ? buildDevState(3) : null);
  const [devPanelOpen, setDevPanelOpen] = useState(false);
  const [devPlayerCount, setDevPlayerCount] = useState(3);
  // Peek result received this tick
  const [activePeek, setActivePeek] = useState<PeekResult | null>(null);
  // Last pass event received this tick
  const [activePassEvent, setActivePassEvent] = useState<LastPassEvent | null>(null);
  // Round result (shown when a bidding round ends with a winner)
  const [activeRoundResult, setActiveRoundResult] = useState<RoundResult | null>(null);
  const prevPhase2AllSelectedRef = useRef(false);
  const [bgmMuted, setBgmMuted] = useState(() => isBGMMuted());
  const [sfxMuted, setSfxMuted] = useState(() => isSFXMuted());
  const [soundPanelOpen, setSoundPanelOpen] = useState(false);
  const soundPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDevPhase2) return;

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

      // Handle pass event
      if (state.lastPassEvent) {
        setActivePassEvent(state.lastPassEvent);
        setTimeout(() => setActivePassEvent(null), 4000);
        playPoint();
      }

      // Handle round result (낙찰 시 띵동)
      if (state.roundResult) {
        setActiveRoundResult(state.roundResult);
        setTimeout(() => setActiveRoundResult(null), 3500);
        playDingDong();
      }

      // Phase2: all players submitted — card reveal
      if (state.phase === 'phase2_playing' && state.allPlayersSelected && !prevPhase2AllSelectedRef.current) {
        playPoint();
      }
      prevPhase2AllSelectedRef.current =
        state.phase === 'phase2_playing' ? state.allPlayersSelected : false;

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
    setActivePassEvent(null);
    setActiveRoundResult(null);
    pauseBGM();
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
      playBGM();
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
      playBGM();
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
  const handlePlayCard = (cardId: number) => {
    if (isDevPhase2) {
      setGameState((prev) => {
        if (!prev) return prev;
        const updatedPlayers = prev.players.map((p) =>
          p.id === DEV_PHASE2_MOCK_ID
            ? { ...p, hasSelected: true, selectedProperty: cardId, properties: p.properties.filter((c) => c !== cardId) }
            : p,
        );
        const allSelected = updatedPlayers.every((p) => p.hasSelected);
        return { ...prev, players: updatedPlayers, allPlayersSelected: allSelected };
      });
      return;
    }
    gameSocket.playCard(cardId);
  };
  const handleSelectItem = (item: ItemType) => gameSocket.selectItem(item);
  const handleUseItemReroll = () => {
    if (isDevPhase2) {
      setGameState((prev) => {
        if (!prev) return prev;
        // 리롤: 현재 부동산 카드를 새 세트로 교체
        const allRealEstate = [11, 14, 9, 6, 13, 4, 12, 8, 2, 15];
        const usedIds = new Set(prev.currentRealEstateCards);
        const fresh = allRealEstate.filter((id) => !usedIds.has(id));
        const newCards = fresh.slice(0, prev.players.length);
        const newItems = { ...prev.playerItems, [DEV_PHASE2_MOCK_ID]: { ...prev.playerItems[DEV_PHASE2_MOCK_ID], used: true } };
        return { ...prev, currentRealEstateCards: newCards, playerItems: newItems };
      });
      return;
    }
    gameSocket.useItemReroll();
  };
  const handleUseItemPeek = (targetId: string) => {
    if (isDevPhase2) {
      const target = gameState?.players.find((p) => p.id === targetId);
      if (target) {
        const topJobCard = target.properties.length > 0 ? Math.max(...target.properties) : null;
        setActivePeek({ requesterId: DEV_PHASE2_MOCK_ID, targetId, targetNickname: target.nickname, realEstateCards: target.realEstateCards, topJobCard });
        setTimeout(() => setActivePeek(null), 4000);
        setGameState((prev) => {
          if (!prev) return prev;
          return { ...prev, playerItems: { ...prev.playerItems, [DEV_PHASE2_MOCK_ID]: { ...prev.playerItems[DEV_PHASE2_MOCK_ID], used: true } } };
        });
      }
      return;
    }
    gameSocket.useItemPeek(targetId);
  };
  const handleUseItemReverse = () => gameSocket.useItemReverse();

  const handleLeaveRoom = () => {
    gameSocket.leaveRoom();
    resetToHome();
  };

  // ── Dev mode handlers ────────────────────────────────────────────────────

  const devChangePlayerCount = (delta: number) => {
    const next = Math.max(2, Math.min(6, devPlayerCount + delta));
    if (next === devPlayerCount) return;
    setDevPlayerCount(next);
    setGameState((prev) => buildDevState(next, prev?.phase2RoundNumber ?? 1));
  };

  const devNextRound = () => {
    setGameState((prev) => {
      if (!prev) return prev;
      const nextRound = prev.phase2RoundNumber + 1;
      const newState = buildDevState(devPlayerCount, nextRound);
      // 이전 라운드에서 내가 선택한 카드가 있으면 부동산 획득 시뮬레이션
      const myPrev = prev.players.find((p) => p.id === DEV_PHASE2_MOCK_ID);
      const wonCard = myPrev?.selectedProperty ?? prev.currentRealEstateCards[0] ?? null;
      const prevRealEstate = myPrev?.realEstateCards ?? [];
      const newRealEstate = wonCard && !prevRealEstate.includes(wonCard)
        ? [...prevRealEstate, wonCard]
        : prevRealEstate;
      const updatedPlayers = newState.players.map((p) =>
        p.id === DEV_PHASE2_MOCK_ID
          ? { ...p, realEstateCards: newRealEstate, realEstateCount: newRealEstate.length }
          : p,
      );
      return { ...newState, players: updatedPlayers };
    });
  };

  const devMakeOpponentsSubmit = () => {
    setGameState((prev) => {
      if (!prev) return prev;
      const updatedPlayers = prev.players.map((p) => {
        if (p.id === DEV_PHASE2_MOCK_ID) return p;
        const cardId = p.properties[0] ?? null;
        return { ...p, hasSelected: !!cardId, selectedProperty: cardId };
      });
      const allSelected = updatedPlayers.every((p) => p.hasSelected);
      return { ...prev, players: updatedPlayers, allPlayersSelected: allSelected };
    });
  };

  const devRevealAll = () => {
    setGameState((prev) => {
      if (!prev) return prev;
      const updatedPlayers = prev.players.map((p) => {
        const cardId = p.selectedProperty ?? p.properties[0] ?? null;
        return { ...p, hasSelected: !!cardId, selectedProperty: cardId };
      });
      return { ...prev, players: updatedPlayers, allPlayersSelected: true };
    });
  };

  const handleToggleBGM = () => {
    const next = !bgmMuted;
    setBGMMuted(next);
    setBgmMuted(next);
    if (!next && (currentScreen === 'lobby' || currentScreen === 'game')) playBGM();
  };
  const handleToggleSFX = () => {
    const next = !sfxMuted;
    setSFXMuted(next);
    setSfxMuted(next);
  };

  // 패널 밖 클릭 시 사운드 패널 닫기
  useEffect(() => {
    if (!soundPanelOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (soundPanelRef.current && !soundPanelRef.current.contains(e.target as Node)) {
        setSoundPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [soundPanelOpen]);

  return (
    <div className="size-full min-h-screen">
      {/* 사운드 온/오프: 상단 가운데 고정, 작은 버튼 하나만 노출, 탭 시 패널 펼침 */}
      <div ref={soundPanelRef} className="fixed top-2 left-1/2 -translate-x-1/2 z-[9998] flex flex-col items-center gap-1.5" style={{ top: 'max(0.5rem, env(safe-area-inset-top))' }}>
        <button
          type="button"
          onClick={() => setSoundPanelOpen((o) => !o)}
          title="소리 설정"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/95 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 active:scale-95 touch-manipulation"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-700" />
        </button>
        {soundPanelOpen && (
          <div className="bg-white/98 border-2 border-black rounded-xl px-3 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2 min-w-[130px]">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-wide">소리</div>
            <button
              type="button"
              onClick={handleToggleBGM}
              className={`flex items-center gap-2 w-full rounded-lg border-2 border-black px-2.5 py-1.5 text-left text-sm font-bold transition-colors touch-manipulation ${bgmMuted ? 'bg-slate-200 text-slate-500' : 'bg-amber-100 text-amber-800'}`}
            >
              <Music2 className="w-4 h-4 flex-shrink-0" />
              <span>BGM</span>
              <span className="ml-auto text-xs">{bgmMuted ? '끔' : '켜짐'}</span>
            </button>
            <button
              type="button"
              onClick={handleToggleSFX}
              className={`flex items-center gap-2 w-full rounded-lg border-2 border-black px-2.5 py-1.5 text-left text-sm font-bold transition-colors touch-manipulation ${sfxMuted ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-800'}`}
            >
              {sfxMuted ? <VolumeX className="w-4 h-4 flex-shrink-0" /> : <Volume2 className="w-4 h-4 flex-shrink-0" />}
              <span>효과음</span>
              <span className="ml-auto text-xs">{sfxMuted ? '끔' : '켜짐'}</span>
            </button>
          </div>
        )}
      </div>

      {isDevPhase2 && (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex flex-col">
          {/* Toggle tab */}
          <button
            onClick={() => setDevPanelOpen((o) => !o)}
            className="self-start ml-2 mt-1 bg-yellow-300 border-2 border-black rounded-b-xl px-3 py-0.5 text-[11px] font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 hover:bg-yellow-200"
          >
            🛠 DEV {devPanelOpen ? '▲ 닫기' : '▼ 열기'}
          </button>

          {/* Panel drawer */}
          {devPanelOpen && (
            <div className="bg-yellow-300 border-b-4 border-x-4 border-black mx-2 rounded-b-2xl px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2.5 text-xs font-black">
              {/* Player count row */}
              <div className="flex items-center gap-3">
                <span className="text-slate-700">플레이어 수</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => devChangePlayerCount(-1)}
                    disabled={devPlayerCount <= 2}
                    className="w-7 h-7 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-base leading-none"
                  >−</button>
                  <span className="w-8 text-center bg-white border-2 border-black rounded-lg py-0.5">{devPlayerCount}</span>
                  <button
                    onClick={() => devChangePlayerCount(1)}
                    disabled={devPlayerCount >= 6}
                    className="w-7 h-7 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-base leading-none"
                  >+</button>
                </div>
                <span className="text-slate-500 font-bold">(2~6명, 부동산 카드도 자동 조정)</span>
              </div>

              {/* Action buttons row */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={devMakeOpponentsSubmit}
                  className="bg-white border-2 border-black px-3 py-1 rounded-lg hover:bg-slate-100"
                >
                  상대방만 제출
                </button>
                <button
                  onClick={devRevealAll}
                  className="bg-white border-2 border-black px-3 py-1 rounded-lg hover:bg-slate-100"
                >
                  전원 제출 → 공개
                </button>
                <button
                  onClick={devNextRound}
                  className="bg-white border-2 border-black px-3 py-1 rounded-lg hover:bg-slate-100"
                >
                  다음 라운드
                </button>
                <button
                  onClick={() => setGameState(buildDevState(devPlayerCount, 1))}
                  className="bg-white border-2 border-black px-3 py-1 rounded-lg hover:bg-red-100"
                >
                  🔄 리셋
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
          activePassEvent={activePassEvent}
          activeRoundResult={activeRoundResult}
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
