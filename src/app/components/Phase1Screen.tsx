import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Eye, ArrowLeftRight, Timer, Coins, HelpCircle, X } from 'lucide-react';
import { GameState, Player, ItemType, PeekResult, LastPassEvent, RoundResult } from '../../lib/socket-types';

// ── Action Toast types ───────────────────────────────────────────────────────
interface ActionToast {
  playerId: string;
  type: 'pass' | 'bid';
  label: string;
  key: number;
}

// ── Job card data ────────────────────────────────────────────────────────────
const JOB_DATA: Record<number, { title: string; emoji: string; color: string }> = {
  1: { title: '폐지 줍기', emoji: '📦', color: '#e2dac9' },
  2: { title: '신문 배달원', emoji: '🚲', color: '#b7d6e6' },
  3: { title: '편의점 야간 알바', emoji: '🏪', color: '#6a90c9' },
  4: { title: '무명 예술가', emoji: '🎨', color: '#d4b48e' },
  5: { title: '사회초년생 인턴', emoji: '👔', color: '#b9c2db' },
  6: { title: '배달 라이더', emoji: '🛵', color: '#f5dd76' },
  7: { title: '계약직 사무 보조', emoji: '🖨️', color: '#d1d5db' },
  8: { title: '프리랜서 작가', emoji: '💻', color: '#e8dcc5' },
  9: { title: '콜센터 상담원', emoji: '🎧', color: '#fbcfe8' },
  10: { title: '중소기업 신입', emoji: '🏢', color: '#f3f4f6' },
  11: { title: '초등 교사', emoji: '🏫', color: '#bce3c4' },
  12: { title: '은행 직원', emoji: '🏦', color: '#bae6fd' },
  13: { title: '7급 공무원', emoji: '📝', color: '#fcd34d' },
  14: { title: '중견기업 대리', emoji: '💼', color: '#f8fafc' },
  15: { title: '병원 간호사', emoji: '💉', color: '#99f6e4' },
  16: { title: '대기업 생산직', emoji: '🏭', color: '#bfdbfe' },
  17: { title: '판교 IT 개발자', emoji: '⌨️', color: '#cbd5e1' },
  18: { title: '대기업 과장', emoji: '📊', color: '#93c5fd' },
  19: { title: '약사', emoji: '💊', color: '#ecfdf5' },
  20: { title: '행정고시 합격', emoji: '📜', color: '#fef08a' },
  21: { title: '대형 로펌 변호사', emoji: '⚖️', color: '#d6d3d1' },
  22: { title: '대학병원 전문의', emoji: '🩺', color: '#5eead4' },
  23: { title: '대기업 임원', emoji: '📈', color: '#fcd34d' },
  24: { title: '100만 유튜버', emoji: '🎥', color: '#fee2e2' },
  25: { title: '성형외과 원장', emoji: '🏥', color: '#ffe4e6' },
  26: { title: '유니콘 스타트업 CEO', emoji: '🦄', color: '#e0e7ff' },
  27: { title: '비트코인 초대박', emoji: '🚀', color: '#86efac' },
  28: { title: '톱스타 연예인', emoji: '⭐', color: '#e879f9' },
  29: { title: '재벌 3세', emoji: '👑', color: '#a1a1aa' },
  30: { title: '조물주 위 건물주', emoji: '🏙️', color: '#7dd3fc' },
};

const ITEM_META = {
  reroll: { icon: RefreshCw, color: 'bg-blue-400', name: '리롤' },
  peek: { icon: Eye, color: 'bg-purple-400', name: '엿보기' },
  reverse: { icon: ArrowLeftRight, color: 'bg-orange-400', name: '리버스' },
};

const AVATARS = ['🧑', '👩', '🧔', '👱', '🧕', '👴'];
const AVATAR_COLORS = [
  'bg-yellow-300', 'bg-pink-300', 'bg-cyan-300',
  'bg-green-300', 'bg-purple-300', 'bg-orange-300',
];

// ── Sub-components ───────────────────────────────────────────────────────────

function JobCard({ id, mini = false, compact = false, showPassBadge = false }: { id: number; mini?: boolean; compact?: boolean; showPassBadge?: boolean }) {
  const d = JOB_DATA[id] || { title: '?', emoji: '❓', color: '#fff' };
  if (mini) {
    return (
      <div
        className="flex-none w-14 h-20 border-2 border-black rounded-lg flex flex-col overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative"
        style={{ backgroundColor: d.color }}
      >
        <div className="absolute top-0.5 left-1 text-sm font-black leading-none">{id}</div>
        <div className="flex-1 flex items-center justify-center text-lg drop-shadow-sm">{d.emoji}</div>
        <div className="bg-white border-t-2 border-black text-[9px] font-black text-center truncate px-0.5 py-0.5 leading-none">{d.title}</div>
      </div>
    );
  }
  const compactClass = compact
    ? 'w-24 h-32 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
    : 'w-28 h-40 border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]';
  return (
    <div
      className={`relative flex flex-col hover:-translate-y-2 transition-transform ${compactClass}`}
      style={{ backgroundColor: d.color }}
    >
      {/* 카드 번호 — 왼쪽 상단 */}
      <div className={`absolute font-black ${compact ? 'text-xs top-0.5 left-1' : 'text-sm top-1 left-2'}`}>{id}</div>
      {/* 포기 시 획득 배지 — 오른쪽 상단 */}
      {showPassBadge && (
        <span className={`absolute right-1 bg-red-400 text-white font-black px-1.5 py-0.5 rounded-full border border-black whitespace-nowrap z-20 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] animate-bounce ${compact ? 'text-[7px] top-0.5' : 'text-[8px] top-1'}`}>
          포기시획득
        </span>
      )}
      <div className={`flex-1 flex items-center justify-center drop-shadow-md ${compact ? 'text-3xl' : 'text-4xl'}`}>{d.emoji}</div>
      <div className={`bg-white border-t-black flex flex-col items-center justify-center ${compact ? 'border-t-2 py-1 px-0.5 rounded-b-lg h-8 text-[9px]' : 'border-t-4 py-1 px-1 rounded-b-lg h-10 text-[10px]'}`}>
        <span className="font-black text-center leading-tight truncate w-full px-0.5">{d.title}</span>
      </div>
    </div>
  );
}

// ── Job Card Scroller ────────────────────────────────────────────────────────

function JobCardScroller({ properties }: { properties: number[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState);
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateScrollState); ro.disconnect(); };
  }, [properties]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-slate-500">내 직업 카드</span>
        {(canScrollLeft || canScrollRight) && (
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
            ← 드래그 →
          </span>
        )}
      </div>
      <div className="relative">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none transition-opacity duration-200"
          style={{
            background: 'linear-gradient(to right, rgba(255,255,255,1), transparent)',
            opacity: canScrollLeft ? 1 : 0,
          }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none transition-opacity duration-200"
          style={{
            background: 'linear-gradient(to left, rgba(255,255,255,1), transparent)',
            opacity: canScrollRight ? 1 : 0,
          }}
        />
        {/* Left arrow button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-6 h-6 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black transition-all duration-200 hover:scale-110 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:scale-95 active:shadow-none"
          style={{ opacity: canScrollLeft ? 1 : 0, pointerEvents: canScrollLeft ? 'auto' : 'none' }}
        >‹</button>
        {/* Right arrow button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-6 h-6 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black transition-all duration-200 hover:scale-110 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:scale-95 active:shadow-none"
          style={{ opacity: canScrollRight ? 1 : 0, pointerEvents: canScrollRight ? 'auto' : 'none' }}
        >›</button>
        <div
          ref={scrollRef}
          className="flex gap-1.5 overflow-x-auto pb-1 px-1 min-h-[84px] items-center"
          style={{ scrollbarWidth: 'none' }}
        >
          {properties.length === 0 ? (
            <span className="text-xs font-bold text-slate-400 w-full text-center">아직 획득한 직업 카드가 없어요</span>
          ) : (
            properties.map((c) => <JobCard key={c} id={c} mini />)
          )}
        </div>
      </div>
    </div>
  );
}

// ── Timer hook ───────────────────────────────────────────────────────────────

function useTimeLeft(startTime: number, timeout: number): number {
  const [timeLeft, setTimeLeft] = useState(timeout);
  useEffect(() => {
    const update = () => {
      const elapsed = (Date.now() / 1000) - startTime;
      setTimeLeft(Math.max(0, Math.ceil(timeout - elapsed)));
    };
    update();
    const id = setInterval(update, 200);
    return () => clearInterval(id);
  }, [startTime, timeout]);
  return timeLeft;
}

// ── Peek Modal ───────────────────────────────────────────────────────────────

function PeekModal({
  phase1,
  opponents,
  onSelect,
  onCancel,
}: {
  phase1: boolean;
  opponents: Player[];
  onSelect: (targetId: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black rounded-3xl p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black">
            {phase1 ? '누구의 남은 돈을 엿볼까요?' : '누구의 부동산을 엿볼까요?'}
          </h3>
          <button onClick={onCancel} className="p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          {opponents.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="flex flex-col items-center p-4 border-4 border-black rounded-xl hover:bg-slate-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 font-black"
            >
              <div className={`w-12 h-12 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} rounded-full border-4 border-black flex items-center justify-center text-xl mb-2`}>
                {AVATARS[idx % AVATARS.length]}
              </div>
              {p.nickname}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface Phase1ScreenProps {
  gameState: GameState;
  currentPlayerId: string;
  activePeek: PeekResult | null;
  activePassEvent: LastPassEvent | null;
  activeRoundResult: RoundResult | null;
  onBid: (amount: number) => void;
  onPass: () => void;
  onUseItemReroll: () => void;
  onUseItemPeek: (targetId: string) => void;
  onUseItemReverse: () => void;
}

export function Phase1Screen({
  gameState,
  currentPlayerId,
  activePeek,
  activePassEvent,
  activeRoundResult,
  onBid,
  onPass,
  onUseItemReroll,
  onUseItemPeek,
  onUseItemReverse,
}: Phase1ScreenProps) {
  const [bidAmount, setBidAmount] = useState(1000);
  const [showPeekSelect, setShowPeekSelect] = useState(false);
  const [bidFlash, setBidFlash] = useState(false);
  const [showMyCards, setShowMyCards] = useState(false);

  // 낙찰 / 포기획득 카드 날아가기 애니메이션
  interface WinFlyState {
    cardId: number;
    startX: number;
    startY: number;
    flyX: string;
    flyY: string;
    phase: 'shine' | 'fly' | 'done';
    source: 'win' | 'pass';
    refunded?: number;
  }
  const [winFly, setWinFly] = useState<WinFlyState | null>(null);
  const wonCardRef = useRef<HTMLDivElement | null>(null);
  const myCardsBtnRef = useRef<HTMLButtonElement | null>(null);

  // 카드 딜링 애니메이션
  type DealPhase = 'deck' | 'dealing' | 'hiding' | 'done';
  const [dealPhase, setDealPhase] = useState<DealPhase>('deck');
  const [dealtCount, setDealtCount] = useState(0);
  const prevRoundForAnimRef = useRef<number>(-1);

  // Per-player action toasts (말풍선)
  const [actionToasts, setActionToasts] = useState<Record<string, ActionToast>>({});
  const toastCounterRef = useRef(0);

  // Track previous state to detect changes
  const prevPlayersRef = useRef<Record<string, { currentBid: number; hasPassed: boolean }>>({});
  const prevRoundRef = useRef<number>(gameState.roundNumber);
  const prevCurrentBidRef = useRef<number>(gameState.currentBid);

  useEffect(() => {
    const prev = prevPlayersRef.current;
    const newToasts: Record<string, ActionToast> = {};

    gameState.players.forEach((player) => {
      if (player.id === currentPlayerId) return;
      const prevPlayer = prev[player.id];
      if (!prevPlayer) return;

      let toastLabel: string | null = null;
      let toastType: 'pass' | 'bid' | null = null;

      if (!prevPlayer.hasPassed && player.hasPassed) {
        toastLabel = '포기 🏳️';
        toastType = 'pass';
      } else if (player.currentBid > prevPlayer.currentBid) {
        toastLabel = `${player.currentBid.toLocaleString()}원 💰`;
        toastType = 'bid';
      }

      if (toastLabel && toastType) {
        toastCounterRef.current += 1;
        newToasts[player.id] = { playerId: player.id, type: toastType, label: toastLabel, key: toastCounterRef.current };
      }
    });

    if (Object.keys(newToasts).length > 0) {
      setActionToasts((prev) => ({ ...prev, ...newToasts }));
      Object.keys(newToasts).forEach((pid) => {
        const key = newToasts[pid].key;
        setTimeout(() => {
          setActionToasts((prev) => {
            if (prev[pid]?.key === key) {
              const next = { ...prev };
              delete next[pid];
              return next;
            }
            return prev;
          });
        }, 2500);
      });
    }

    // Update prev snapshot
    const snapshot: Record<string, { currentBid: number; hasPassed: boolean }> = {};
    gameState.players.forEach((p) => {
      snapshot[p.id] = { currentBid: p.currentBid, hasPassed: p.hasPassed };
    });
    prevPlayersRef.current = snapshot;
  }, [gameState.players, currentPlayerId]);

  const timeLeft = useTimeLeft(gameState.turnStartTime, gameState.turnTimeout);

  const me = gameState.players.find((p) => p.id === currentPlayerId);
  const opponents = gameState.players.filter((p) => p.id !== currentPlayerId);
  const isMyTurn = gameState.currentTurn === currentPlayerId;
  const myItem = gameState.playerItems[currentPlayerId];
  const isFirstTurn = gameState.currentBid === 0 && !gameState.players.some((p) => p.hasPassed);

  const minBid = gameState.currentBid + 1000;
  const myEffectiveCoins = (me?.coins ?? 0) + (me?.currentBid ?? 0);
  const canAffordMinBid = myEffectiveCoins >= minBid;
  const canBid = isMyTurn && dealPhase === 'done' && bidAmount >= minBid && bidAmount <= myEffectiveCoins;
  // 잔액 부족해도 포기는 항상 가능 (mustBid 제외, 딜링 완료 후에만)
  const canPass = isMyTurn && dealPhase === 'done' && gameState.mustBidPlayer !== currentPlayerId;
  const isMustBid = gameState.mustBidPlayer === currentPlayerId;

  // 라운드가 바뀌면 bidAmount를 최솟값으로 리셋
  useEffect(() => {
    if (gameState.roundNumber !== prevRoundRef.current) {
      prevRoundRef.current = gameState.roundNumber;
      setBidAmount(1000);
    }
  }, [gameState.roundNumber]);

  // minBid가 올라가면 bidAmount도 따라 올라감
  useEffect(() => {
    setBidAmount((prev) => Math.max(prev, minBid));
  }, [minBid]);

  // currentBid가 바뀌면 flash 애니메이션
  useEffect(() => {
    if (gameState.currentBid !== prevCurrentBidRef.current) {
      prevCurrentBidRef.current = gameState.currentBid;
      if (gameState.currentBid > 0) {
        setBidFlash(true);
        setTimeout(() => setBidFlash(false), 600);
      }
    }
  }, [gameState.currentBid]);

  // 낙찰 / 포기획득 공통 카드 fly 트리거 — 타이머 ref로 관리해 리렌더로 인한 취소 방지
  const flyTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const triggerCardFly = (cardId: number, source: 'win' | 'pass', refunded?: number) => {
    flyTimersRef.current.forEach(clearTimeout);
    flyTimersRef.current = [];
    const cardEl = wonCardRef.current;
    const btnEl = myCardsBtnRef.current;
    const startX = cardEl
      ? cardEl.getBoundingClientRect().left + cardEl.getBoundingClientRect().width / 2
      : window.innerWidth / 2;
    const startY = cardEl
      ? cardEl.getBoundingClientRect().top + cardEl.getBoundingClientRect().height / 2
      : window.innerHeight / 2;
    const flyX = btnEl
      ? `${btnEl.getBoundingClientRect().left + btnEl.getBoundingClientRect().width / 2 - startX}px`
      : '0px';
    const flyY = btnEl
      ? `${btnEl.getBoundingClientRect().top + btnEl.getBoundingClientRect().height / 2 - startY}px`
      : '0px';
    setWinFly({ cardId, startX, startY, flyX, flyY, phase: 'shine', source, refunded });
    const shineDelay = source === 'pass' ? 1100 : 600;
    const totalDelay = source === 'pass' ? 1800 : 1300;
    flyTimersRef.current.push(
      setTimeout(() => setWinFly((p) => p ? { ...p, phase: 'fly' } : null), shineDelay),
      setTimeout(() => { setWinFly(null); setShowMyCards(true); flyTimersRef.current = []; }, totalDelay),
    );
  };

  // 낙찰 이벤트 → 카드 빛남 후 획득카드 버튼으로 날아가기
  const prevWinResultRef = useRef<typeof activeRoundResult>(null);
  useEffect(() => {
    if (!activeRoundResult) { prevWinResultRef.current = null; return; }
    if (activeRoundResult === prevWinResultRef.current) return;
    if (activeRoundResult.winnerId !== currentPlayerId) return;
    prevWinResultRef.current = activeRoundResult;
    const cardId = activeRoundResult.wonCard;
    if (!cardId) return;
    triggerCardFly(cardId, 'win');
  }, [activeRoundResult, currentPlayerId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 포기획득 이벤트 → 동일한 shine → fly 애니메이션
  const prevPassEventRef = useRef<typeof activePassEvent>(null);
  useEffect(() => {
    if (!activePassEvent) { prevPassEventRef.current = null; return; }
    if (activePassEvent === prevPassEventRef.current) return;
    if (activePassEvent.playerId !== currentPlayerId) return;
    prevPassEventRef.current = activePassEvent;
    const cardId = activePassEvent.acquiredCard;
    if (!cardId) return;
    triggerCardFly(cardId, 'pass', activePassEvent.refunded);
  }, [activePassEvent, currentPlayerId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 라운드가 바뀔 때마다 카드 딜링 애니메이션 재생
  useEffect(() => {
    if (prevRoundForAnimRef.current === gameState.roundNumber) return;
    prevRoundForAnimRef.current = gameState.roundNumber;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setDealPhase('deck');
    setDealtCount(0);
    const count = gameState.currentProperties.length;
    if (count === 0) { setDealPhase('done'); return; }
    const startDelay = 275;
    const cardInterval = 170;
    for (let i = 0; i < count; i++) {
      timers.push(setTimeout(() => {
        if (i === 0) setDealPhase('dealing');
        setDealtCount(i + 1);
      }, startDelay + i * cardInterval));
    }
    const totalDealTime = startDelay + (count - 1) * cardInterval;
    timers.push(setTimeout(() => setDealPhase('hiding'), totalDealTime + 190));
    timers.push(setTimeout(() => setDealPhase('done'), totalDealTime + 420));
    return () => timers.forEach(clearTimeout);
  }, [gameState.roundNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  const adjustBid = (delta: number) => {
    setBidAmount((prev) => {
      const next = Math.round((prev + delta) / 1000) * 1000;
      return Math.min(Math.max(next, minBid), myEffectiveCoins);
    });
  };

  const handleUseItem = (type: ItemType) => {
    if (!isMyTurn || !myItem || myItem.item !== type || myItem.used) return;
    if (type === 'reroll') onUseItemReroll();
    else if (type === 'peek') setShowPeekSelect(true);
    else if (type === 'reverse') onUseItemReverse();
  };

  const isRerollUsable = isMyTurn && !myItem?.used && myItem?.item === 'reroll' && isFirstTurn;
  const isPeekUsable = isMyTurn && !myItem?.used && myItem?.item === 'peek';
  const isReverseUsable =
    isMyTurn &&
    !myItem?.used &&
    myItem?.item === 'reverse' &&
    !gameState.reverseUsedThisRound;

  const playerIndex = (id: string) => gameState.players.findIndex((p) => p.id === id);

  return (
    <div
      className="min-h-screen flex flex-col font-sans relative"
      style={{
        backgroundColor: '#fef9c3',
        backgroundImage: 'radial-gradient(#fde047 20%, transparent 20%), radial-gradient(#fde047 20%, transparent 20%)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
      }}
    >
      {/* Peek select modal */}
      {showPeekSelect && (
        <PeekModal
          phase1={true}
          opponents={opponents}
          onSelect={(id) => { setShowPeekSelect(false); onUseItemPeek(id); }}
          onCancel={() => setShowPeekSelect(false)}
        />
      )}

      {/* Peek result notification */}
      {activePeek && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-purple-400 border-4 border-black rounded-2xl p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center min-w-[280px]">
          <Eye className="w-8 h-8 mx-auto mb-1 text-white" />
          <p className="font-black text-white text-sm mb-1">
            👁️ {activePeek.targetNickname}의 비밀 정보
          </p>
          {activePeek.money !== undefined && (
            <p className="font-black text-yellow-200 text-2xl">{activePeek.money.toLocaleString()}원</p>
          )}
        </div>
      )}

      {/* 포기 획득 토스트 → winFly 애니메이션으로 통합 처리 */}

      {/* 낙찰 카드 → 획득카드 버튼으로 날아가는 오버레이 */}
      {winFly && winFly.phase !== 'done' && (() => {
        const d = JOB_DATA[winFly.cardId] || { title: '?', emoji: '❓', color: '#fff' };
        const isShine = winFly.phase === 'shine';
        return (
          <>
            {/* shine 단계: 화면 중앙에 크게 표시 */}
            {isShine && (
              <div
                className="fixed inset-0 z-[65] flex items-center justify-center pointer-events-none"
                style={{ animation: 'cardWinShine 0.6s ease-out forwards' }}
              >
                <div className="flex flex-col items-center gap-2">
                  <span className={`font-black text-lg animate-bounce ${winFly.source === 'pass' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {winFly.source === 'pass' ? '🏳️ 포기 획득!' : '🎉 낙찰!'}
                  </span>
                  <div
                    className="w-28 h-40 border-4 border-black rounded-xl flex flex-col overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    style={{ backgroundColor: d.color }}
                  >
                    <div className="relative px-1 pt-0.5 text-sm font-black">{winFly.cardId}</div>
                    <div className="flex-1 flex items-center justify-center text-5xl">{d.emoji}</div>
                    <div className="bg-white border-t-2 border-black text-[10px] font-black text-center py-1 truncate px-1">{d.title}</div>
                  </div>
                  {winFly.source === 'pass' && winFly.refunded != null && winFly.refunded > 0 && (
                    <div className="bg-white border-2 border-black rounded-xl px-3 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5">
                      <span className="text-base">💰</span>
                      <span className="font-black text-sm text-slate-700">환급</span>
                      <span className="font-black text-sm text-green-600">+{winFly.refunded.toLocaleString()}원</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* fly 단계: 원래 위치에서 획득카드 버튼으로 날아감 */}
            {!isShine && (
              <div
                className="fixed z-[70] pointer-events-none"
                style={{
                  left: winFly.startX - 40,
                  top: winFly.startY - 56,
                  width: 80,
                  height: 112,
                  '--fly-x': winFly.flyX,
                  '--fly-y': winFly.flyY,
                  animation: 'cardFlyToBtn 0.65s cubic-bezier(0.4, 0, 0.8, 0.6) forwards',
                } as React.CSSProperties}
              >
                <div className="w-full h-full border-4 border-black rounded-xl flex flex-col overflow-hidden shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                  style={{ backgroundColor: d.color }}>
                  <div className="absolute top-0.5 left-1 text-[9px] font-black opacity-60">{winFly.cardId}</div>
                  <div className="flex-1 flex items-center justify-center text-3xl">{d.emoji}</div>
                  <div className="bg-white border-t-2 border-black text-[9px] font-black text-center py-1 truncate px-0.5">{d.title}</div>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* Opponents area */}
      <div className="bg-slate-100 border-b-4 border-black p-4 flex justify-center gap-4 relative">
        {/* 왼쪽: Phase 라벨 + 라운드 */}
        <div className="absolute top-3 left-3 flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-black">Phase 1. 직업 경매</span>
            {gameState.turnDirection === -1 && (
              <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse font-black">
                ↩ 역방향!
              </span>
            )}
          </div>
          <div className="font-black text-sm pl-1">라운드 {gameState.roundNumber}</div>
        </div>

        {/* Timer */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white border-4 border-black rounded-full px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Timer className="w-4 h-4 text-red-500 animate-pulse" />
          <span className={`font-black text-sm ${timeLeft <= 3 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
            {timeLeft}s
          </span>
        </div>

        {/* 전체 플레이어 목록 (나 포함) — 1~3: 1줄, 4: 2×2, 5~6: 3열 */}
        {(() => {
          const allPlayers = gameState.players;
          const activePlayers = allPlayers.filter((p) => !p.hasPassed);
          const currentIdx = activePlayers.findIndex((p) => p.id === gameState.currentTurn);
          let nextPlayerId: string | null = null;
          if (currentIdx !== -1 && activePlayers.length > 1) {
            const nextIdx = (currentIdx + gameState.turnDirection + activePlayers.length) % activePlayers.length;
            nextPlayerId = activePlayers[nextIdx].id;
          }
          const total = allPlayers.length;

          return (
            <div
              className={`mt-12 gap-2 justify-items-center ${
                total <= 3
                  ? 'flex flex-wrap justify-center'
                  : total === 4
                  ? 'grid grid-cols-2'
                  : 'grid grid-cols-3'
              }`}
            >
              {allPlayers.map((player, i) => {
                const idx = playerIndex(player.id);
                const isMe = player.id === currentPlayerId;
                const isTheirTurn = gameState.currentTurn === player.id;
                const isNext = !isTheirTurn && player.id === nextPlayerId;
                const pi = gameState.playerItems[player.id];
                const piMeta = pi?.item ? ITEM_META[pi.item] : null;
                const toast = actionToasts[player.id];
                // 마지막 줄 홀수 셀 가운데 정렬 (5명→5번째, 7명→7번째 등)
                const colsPerRow = total <= 3 ? total : total === 4 ? 2 : 3;
                const lastRowCount = total % colsPerRow;
                const isLastRowCenter = lastRowCount > 0 && i >= total - lastRowCount && i === total - lastRowCount && lastRowCount < colsPerRow;
                const colStartClass = isLastRowCenter
                  ? lastRowCount === 1 ? 'col-start-2' : ''
                  : '';
                return (
                  <div
                    key={player.id}
                    className={`relative flex flex-col items-center p-2 border-2 border-black rounded-lg w-20 ${
                      player.hasPassed ? 'bg-slate-300 opacity-60' : 'bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    } ${isMe ? 'border-yellow-500 bg-yellow-50' : ''} ${isTheirTurn ? 'ring-2 ring-yellow-400 -translate-y-1' : ''} ${isNext ? 'ring-2 ring-blue-300' : ''} ${colStartClass}`}
                  >
                    {/* Action toast bubble */}
                    {toast && (
                      <div
                        key={toast.key}
                        className={`absolute -top-8 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap px-1.5 py-0.5 rounded-lg border-2 border-black font-black text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] pointer-events-none ${
                          toast.type === 'pass' ? 'bg-red-400 text-white' : 'bg-green-400 text-white'
                        }`}
                        style={{ animation: 'toastPop 0.25s ease-out' }}
                      >
                        {toast.label}
                        <span
                          className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-0"
                          style={{
                            borderLeft: '4px solid transparent',
                            borderRight: '4px solid transparent',
                            borderTop: `5px solid ${toast.type === 'pass' ? '#f87171' : '#4ade80'}`,
                          }}
                        />
                      </div>
                    )}

                    {/* 배지: 고민 중 / 다음 차례 / 나 */}
                    {isMe && !isTheirTurn && !toast && (
                      <span className="absolute -top-3 bg-yellow-500 border-2 border-black rounded-full px-1.5 py-0.5 text-[8px] font-black text-white z-10">
                        나
                      </span>
                    )}
                    {isTheirTurn && !toast && (
                      <span className="absolute -top-3 bg-yellow-400 border-2 border-black rounded-full px-1.5 py-0.5 text-[8px] font-black animate-bounce z-10">
                        {isMe ? '내 차례!' : '고민 중...'}
                      </span>
                    )}
                    {isNext && !toast && (
                      <span className="absolute -top-3 bg-blue-400 border-2 border-black rounded-full px-1.5 py-0.5 text-[8px] font-black z-10 whitespace-nowrap">
                        다음 차례
                      </span>
                    )}

                    <div className={`relative w-9 h-9 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} rounded-full border-2 border-black flex items-center justify-center text-base mb-0.5`}>
                      {AVATARS[idx % AVATARS.length]}
                      {piMeta && (
                        <div className={`absolute -bottom-0.5 -left-0.5 w-4 h-4 ${piMeta.color} ${pi?.used ? 'grayscale opacity-70' : ''} rounded-full border border-black flex items-center justify-center`}>
                          {(() => { const Icon = piMeta.icon; return <Icon className="w-2 h-2 text-white" />; })()}
                          {pi?.used && <X className="absolute inset-0 m-auto w-2.5 h-2.5 text-red-600" />}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-[10px] truncate w-full text-center leading-tight">
                      {player.nickname}{isMe && <span className="text-yellow-600"> ★</span>}
                    </span>
                    {player.hasPassed ? (
                      <span className="text-[9px] font-black text-red-600 bg-red-100 px-1 py-0.5 mt-0.5 rounded border border-red-300">포기</span>
                    ) : (
                      <span className="text-[9px] font-black text-blue-600 bg-blue-100 px-1 py-0.5 mt-0.5 rounded border border-blue-300">
                        {player.currentBid > 0 ? `${player.currentBid.toLocaleString()}원` : '대기'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Center board: job cards on table — 딜링 애니메이션 */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 bg-green-50 relative">
        {(() => {
          const cardsCompact = gameState.currentProperties.length >= 4;
          const cardW = cardsCompact ? 'w-20' : 'w-28';
          const cardH = cardsCompact ? 'h-28' : 'h-40';
          const cardCount = gameState.currentProperties.length;
          const isTwoRow = cardCount >= 4;
          return (
            <div className={`relative ${isTwoRow ? 'flex flex-col items-center' : 'flex items-center justify-center'}`}>
              {/* Deck — 딜링 중에만 표시, 항상 absolute로 카드 그리드 위에 오버레이 */}
              {dealPhase !== 'done' && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 w-20 h-32 bg-slate-800 border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center"
                  style={{
                    animation: dealPhase === 'hiding'
                      ? 'deckDisappear 0.45s ease-in forwards'
                      : 'deckAppear 0.35s ease-out forwards',
                  }}
                >
                  <span className="text-white font-black text-center text-[10px] px-2 border-2 border-white rounded-lg p-1">직업<br />카드<br />더미</span>
                </div>
              )}
              {/* Face-up job cards */}
              <div
                className={`gap-2 items-end ${
                  cardCount <= 3
                    ? 'flex'
                    : cardCount === 4
                    ? 'grid grid-cols-2 justify-items-center'
                    : 'grid grid-cols-3 justify-items-center'
                }`}
              >
                {gameState.currentProperties.map((cardId, i) => {
                  const isFifthInFive = cardCount === 5 && i === 4;
                  const isDealt = i < dealtCount;
                  const isWonCard = activeRoundResult?.winnerId === currentPlayerId && activeRoundResult?.wonCard === cardId;
                  return (
                    <div
                      key={cardId}
                      ref={isWonCard ? wonCardRef : null}
                      className={`relative ${isFifthInFive ? 'col-start-2' : ''} ${isDealt ? 'card-deal-in' : `opacity-0 ${cardW} ${cardH}`}`}
                    >
                      {/* 포기 시 획득 — 카드 바깥 상단 (고민 중... 스타일) */}
                      {isDealt && i === 0 && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-red-400 border-2 border-black rounded-full px-2 py-0.5 text-[8px] font-black text-white animate-bounce z-20 whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          포기시 획득
                        </span>
                      )}
                      {isDealt && (
                        <JobCard id={cardId} compact={cardsCompact} showPassBadge={false} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Current bid display — 딜링 완료 후 & 낙찰 전 & 현재 라운드 딜링이 시작된 후에만 표시 */}
        {gameState.currentBid > 0 && !activeRoundResult && dealPhase === 'done' && prevRoundForAnimRef.current === gameState.roundNumber && (
          <div
            className="mt-3 bg-yellow-400 border-2 border-black rounded-xl px-4 py-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            style={bidFlash ? { animation: 'bidPop 0.5s ease-out' } : undefined}
          >
            <span className="font-black text-slate-800 text-sm">현재 최고가: </span>
            <span className="font-black text-lg">{gameState.currentBid.toLocaleString()}원</span>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className={`border-t-4 border-black px-3 pt-2 pb-3 flex flex-col gap-2 transition-colors ${isMyTurn ? 'bg-yellow-100' : 'bg-slate-50'}`}>

        {/* Top row: 아이템 버튼 + 획득카드 버튼 */}
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            {myItem?.item ? (() => {
              const itemId = myItem.item as ItemType;
              const meta = ITEM_META[itemId];
              const Icon = meta.icon;
              const usable = itemId === 'reroll' ? isRerollUsable
                : itemId === 'peek' ? isPeekUsable
                : isReverseUsable;
              const disabledReason = myItem.used ? '사용됨'
                : !isMyTurn ? '내 턴 아님'
                : itemId === 'reroll' && !isFirstTurn ? '첫 턴에만 가능'
                : itemId === 'reverse' && gameState.reverseUsedThisRound ? '이번 라운드 사용됨'
                : '';
              return (
                <button
                  onClick={() => handleUseItem(itemId)}
                  disabled={!usable}
                  title={disabledReason}
                  className={`flex items-center gap-1 px-2.5 py-1.5 border-2 border-black rounded-full font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform whitespace-nowrap ${
                    myItem.used
                      ? 'bg-slate-300 text-slate-500 grayscale line-through'
                      : usable
                      ? `${meta.color} hover:-translate-y-0.5`
                      : `${meta.color} opacity-40 cursor-not-allowed`
                  }`}
                >
                  <Icon className="w-3 h-3 text-black" />
                  {meta.name}
                  {disabledReason && <span className="opacity-60">({disabledReason})</span>}
                </button>
              );
            })() : (
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> 아이템 없음
              </span>
            )}
          </div>

          {/* 획득카드 버튼 */}
          <button
            ref={myCardsBtnRef}
            onClick={() => setShowMyCards((v) => !v)}
            className="flex items-center gap-1 px-2.5 py-1.5 border-2 border-black rounded-full bg-amber-400 font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform whitespace-nowrap"
          >
            🗂 획득카드 {(me?.properties?.length ?? 0) > 0 && <span className="bg-black text-white rounded-full px-1">{me!.properties.length}</span>}
          </button>
        </div>

        {/* 획득카드 슬라이드 패널 */}
        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: showMyCards ? '120px' : '0px', opacity: showMyCards ? 1 : 0 }}
        >
          <div className="pt-1 pb-2">
            {(me?.properties?.length ?? 0) === 0 ? (
              <span className="text-xs font-bold text-slate-400">아직 획득한 직업 카드가 없어요</span>
            ) : (
              <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {me!.properties.map((c) => <JobCard key={c} id={c} mini />)}
              </div>
            )}
          </div>
        </div>

        {/* My info + bid controls */}
        <div className="flex items-stretch gap-2">
          {/* My avatar & coins */}
          <div className="flex items-center gap-2 bg-white border-2 border-black rounded-xl px-2.5 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div className={`w-8 h-8 flex-none ${AVATAR_COLORS[playerIndex(currentPlayerId) % AVATAR_COLORS.length]} rounded-full border-2 border-black flex items-center justify-center text-base`}>
              {AVATARS[playerIndex(currentPlayerId) % AVATARS.length]}
            </div>
            <div className="min-w-0">
              <div className="font-black text-xs whitespace-nowrap leading-tight">
                {me?.nickname} <span className="text-[9px] bg-blue-500 text-white px-1 py-0.5 rounded-full">나</span>
                {isMustBid && <span className="ml-0.5 text-[9px] bg-red-500 text-white px-1 py-0.5 rounded-full animate-pulse">필수!</span>}
              </div>
              <div className="flex items-center gap-0.5 text-xs font-bold text-slate-600 whitespace-nowrap">
                <Coins className="w-3 h-3 text-yellow-500 flex-none" />
                {me?.coins.toLocaleString()}원
              </div>
              {(me?.currentBid ?? 0) > 0 && (
                <div className="text-[10px] font-bold text-blue-600 whitespace-nowrap">입찰: {me?.currentBid.toLocaleString()}원</div>
              )}
            </div>
          </div>

          {/* Bid / Pass controls */}
          <div className="flex flex-col gap-1.5 flex-1">
            {isMyTurn && !canAffordMinBid && !isMustBid && (
              <div className="bg-orange-100 border border-orange-400 rounded-lg px-2 py-1 text-center">
                <span className="font-black text-[10px] text-orange-700">잔액 부족 — 포기하세요</span>
              </div>
            )}
            <div className={`flex bg-white border-2 border-black rounded-lg overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isMyTurn && !canAffordMinBid ? 'opacity-40' : ''}`}>
              <button
                onClick={() => adjustBid(-1000)}
                disabled={!isMyTurn || !canAffordMinBid}
                className="px-2.5 bg-slate-200 hover:bg-slate-300 font-black text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >-</button>
              <div className="flex-1 text-center py-1.5 font-black text-xs">{bidAmount.toLocaleString()}</div>
              <button
                onClick={() => adjustBid(1000)}
                disabled={!isMyTurn || !canAffordMinBid}
                className="px-2.5 bg-slate-200 hover:bg-slate-300 font-black text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >+</button>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => onBid(bidAmount)}
                disabled={!canBid}
                className="flex-1 py-2 bg-green-400 hover:bg-green-300 disabled:bg-slate-300 disabled:cursor-not-allowed border-2 border-black rounded-lg font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all text-xs"
              >
                베팅 ({bidAmount.toLocaleString()})
              </button>
              <button
                onClick={onPass}
                disabled={!canPass}
                className={`flex-1 py-2 border-2 border-black rounded-lg font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none transition-all text-xs ${
                  isMustBid
                    ? 'bg-slate-300 cursor-not-allowed'
                    : isMyTurn && !canAffordMinBid
                    ? 'bg-red-500 hover:bg-red-400 text-white animate-pulse'
                    : 'bg-red-400 hover:bg-red-300 disabled:bg-slate-300 disabled:cursor-not-allowed'
                }`}
              >
                {isMustBid ? '포기불가!' : '포기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
