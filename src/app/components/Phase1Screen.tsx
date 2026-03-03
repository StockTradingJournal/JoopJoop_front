import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Eye, ArrowLeftRight, Timer, Coins, HelpCircle, X } from 'lucide-react';
import { GameState, Player, ItemType, PeekResult } from '../../lib/socket-types';

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

function JobCard({ id, mini = false, showPassBadge = false }: { id: number; mini?: boolean; showPassBadge?: boolean }) {
  const d = JOB_DATA[id] || { title: '?', emoji: '❓', color: '#fff' };
  if (mini) {
    return (
      <div
        className="flex-none w-14 h-20 border-2 border-black rounded-lg flex flex-col overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        style={{ backgroundColor: d.color }}
      >
        <div className="flex-1 flex items-center justify-center text-lg drop-shadow-sm">{d.emoji}</div>
        <div className="bg-white border-t-2 border-black text-[9px] font-black text-center truncate px-0.5 py-0.5 leading-none">{d.title}</div>
      </div>
    );
  }
  return (
    <div
      className="relative w-24 h-36 border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col hover:-translate-y-2 transition-transform"
      style={{ backgroundColor: d.color }}
    >
      <div className="absolute top-1 left-2 text-xs font-black opacity-60">{id}</div>
      <div className="flex-1 flex items-center justify-center text-4xl drop-shadow-md">{d.emoji}</div>
      <div className="bg-white border-t-4 border-black py-1 px-1 flex flex-col items-center rounded-b-lg h-10 justify-center">
        <span className="font-black text-[10px] text-center leading-tight">{d.title}</span>
      </div>
      {showPassBadge && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-red-400 text-white font-black text-[9px] px-2 py-0.5 rounded-full border-2 border-black whitespace-nowrap z-20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-bounce">
          포기 시 획득
        </span>
      )}
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
  onBid,
  onPass,
  onUseItemReroll,
  onUseItemPeek,
  onUseItemReverse,
}: Phase1ScreenProps) {
  const [bidAmount, setBidAmount] = useState(1000);
  const [showPeekSelect, setShowPeekSelect] = useState(false);
  /** 응찰 시 "현재 최고가" 박스 재생할 강조 애니메이션 */
  const [playBidAnimation, setPlayBidAnimation] = useState(false);
  const prevBidRef = useRef(gameState.currentBid);

  const timeLeft = useTimeLeft(gameState.turnStartTime, gameState.turnTimeout);

  useEffect(() => {
    if (gameState.currentBid > 0 && gameState.currentBid !== prevBidRef.current) {
      setPlayBidAnimation(true);
      prevBidRef.current = gameState.currentBid;
      const t = setTimeout(() => setPlayBidAnimation(false), 500);
      return () => clearTimeout(t);
    }
  }, [gameState.currentBid]);

  const me = gameState.players.find((p) => p.id === currentPlayerId);
  const opponents = gameState.players.filter((p) => p.id !== currentPlayerId);
  const isMyTurn = gameState.currentTurn === currentPlayerId;
  const myItem = gameState.playerItems[currentPlayerId];
  const isFirstTurn = gameState.currentBid === 0 && !gameState.players.some((p) => p.hasPassed);

  const minBid = gameState.currentBid + 1000;
  const myEffectiveCoins = (me?.coins ?? 0) + (me?.currentBid ?? 0);
  const canBid = isMyTurn && bidAmount >= minBid && bidAmount <= myEffectiveCoins;
  const canPass = isMyTurn && gameState.mustBidPlayer !== currentPlayerId;
  const isMustBid = gameState.mustBidPlayer === currentPlayerId;

  // 라운드가 바뀌면 배팅 금액을 1000으로 초기화
  useEffect(() => {
    setBidAmount(1000);
  }, [gameState.roundNumber]);

  // Update bid input when min changes
  useEffect(() => {
    setBidAmount((prev) => Math.max(prev, minBid));
  }, [minBid]);

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

      {/* Opponents area */}
      <div className="bg-slate-100 border-b-4 border-black p-4 flex justify-center gap-4 relative">
        <div className="absolute top-3 left-3">
          <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-black">Phase 1. 직업 경매</span>
          <div className="mt-1 font-black text-sm">
            라운드 {gameState.roundNumber}
            {gameState.turnDirection === -1 && (
              <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                ↩ 역방향 진행중!
              </span>
            )}
          </div>
        </div>

        {/* Timer */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white border-4 border-black rounded-full px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Timer className="w-4 h-4 text-red-500 animate-pulse" />
          <span className={`font-black text-sm ${timeLeft <= 3 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
            {timeLeft}s
          </span>
        </div>

        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          {opponents.map((player) => {
            const idx = playerIndex(player.id);
            const isTheirTurn = gameState.currentTurn === player.id;
            const pi = gameState.playerItems[player.id];
            const piMeta = pi?.item ? ITEM_META[pi.item] : null;
            return (
              <div
                key={player.id}
                className={`relative flex flex-col items-center p-3 border-4 border-black rounded-xl w-28 ${
                  player.hasPassed ? 'bg-slate-300 opacity-60' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                } ${isTheirTurn ? 'ring-4 ring-yellow-400 -translate-y-2' : ''}`}
              >
                {isTheirTurn && (
                  <span className="absolute -top-4 bg-yellow-400 border-2 border-black rounded-full px-2 py-0.5 text-[10px] font-black animate-bounce z-10">
                    고민 중...
                  </span>
                )}
                <div className={`relative w-12 h-12 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} rounded-full border-4 border-black flex items-center justify-center text-xl mb-1`}>
                  {AVATARS[idx % AVATARS.length]}
                  {piMeta && (
                    <div className={`absolute -bottom-1 -left-1 w-6 h-6 ${piMeta.color} ${pi?.used ? 'grayscale opacity-70' : ''} rounded-full border-2 border-black flex items-center justify-center`}>
                      {(() => { const Icon = piMeta.icon; return <Icon className="w-3 h-3 text-white" />; })()}
                      {pi?.used && <X className="absolute inset-0 m-auto w-4 h-4 text-red-600" />}
                    </div>
                  )}
                </div>
                <span className="font-bold text-xs truncate w-full text-center">{player.nickname}</span>
                {player.hasPassed ? (
                  <span className="text-xs font-black text-red-600 bg-red-100 px-2 py-0.5 mt-1 rounded border-2 border-red-300">포기</span>
                ) : (
                  <span className="text-xs font-black text-blue-600 bg-blue-100 px-2 py-0.5 mt-1 rounded border-2 border-blue-300">
                    {player.currentBid > 0 ? `${player.currentBid.toLocaleString()}원` : '대기 중'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Center board: job cards on table */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-green-50 relative">
        <div className="flex items-end gap-4 md:gap-6">
          {/* Deck */}
          <div className="w-20 h-32 bg-slate-800 border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-[-5deg]">
            <span className="text-white font-black text-center text-[10px] px-2 border-2 border-white rounded-lg p-1">직업<br />카드<br />더미</span>
          </div>

          {/* Face-up job cards */}
          <div className="flex gap-3 items-end">
            {gameState.currentProperties.map((cardId, i) => (
              <JobCard key={cardId} id={cardId} showPassBadge={i === 0} />
            ))}
          </div>
        </div>

        {/* Current bid display */}
        {gameState.currentBid > 0 && (
          <div
            className={`mt-4 bg-yellow-400 border-4 border-black rounded-2xl px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${playBidAnimation ? 'phase1-bid-animate' : ''}`}
          >
            <span className="font-black text-slate-800">현재 최고가: </span>
            <span className="font-black text-2xl">{gameState.currentBid.toLocaleString()}원</span>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className={`border-t-4 border-black p-4 flex flex-col gap-3 transition-colors ${isMyTurn ? 'bg-yellow-100' : 'bg-slate-50'}`}>

        {/* Item panel */}
        {myItem?.item && (
          <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-3">
            <div className="flex items-center gap-1 font-black text-sm text-slate-600">
              <HelpCircle className="w-4 h-4" /> 내 아이템
            </div>
            {(() => {
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
                  className={`flex items-center gap-2 px-4 py-2 border-4 border-black rounded-full font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform ${
                    myItem.used
                      ? 'bg-slate-300 text-slate-500 grayscale line-through'
                      : usable
                      ? `${meta.color} hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
                      : `${meta.color} opacity-40 cursor-not-allowed`
                  }`}
                >
                  <Icon className="w-4 h-4 text-black" />
                  {meta.name} 사용하기
                  {disabledReason && <span className="text-[10px] opacity-70">({disabledReason})</span>}
                </button>
              );
            })()}
          </div>
        )}

        {/* My info + bid controls */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* My avatar & coins */}
          <div className="flex items-center gap-3 bg-white border-4 border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] min-w-[180px]">
            <div className={`w-12 h-12 ${AVATAR_COLORS[playerIndex(currentPlayerId) % AVATAR_COLORS.length]} rounded-full border-4 border-black flex items-center justify-center text-xl`}>
              {AVATARS[playerIndex(currentPlayerId) % AVATARS.length]}
            </div>
            <div>
              <div className="font-black text-base">
                {me?.nickname} <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">나</span>
                {isMustBid && <span className="ml-1 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse">필수베팅!</span>}
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-600">
                <Coins className="w-4 h-4 text-yellow-500" />
                {me?.coins.toLocaleString()}원
              </div>
              {(me?.currentBid ?? 0) > 0 && (
                <div className="text-xs font-bold text-blue-600">입찰: {me?.currentBid.toLocaleString()}원</div>
              )}
            </div>
          </div>

          {/* My job cards */}
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1 flex-1 max-w-xs">
            {(me?.properties.length ?? 0) === 0 ? (
              <span className="text-sm font-bold text-slate-400 self-center">획득한 직업 카드 없음</span>
            ) : (
              me?.properties.map((c) => <JobCard key={c} id={c} mini />)
            )}
          </div>

          {/* Bid / Pass controls */}
          <div className="flex flex-col gap-2 min-w-[240px]">
            <div className="flex gap-2">
              {/* Bid input */}
              <div className="flex-1 flex bg-white border-4 border-black rounded-xl overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <button
                  onClick={() => adjustBid(-1000)}
                  disabled={!isMyTurn}
                  className="px-3 bg-slate-200 hover:bg-slate-300 font-black text-lg disabled:opacity-40"
                >-</button>
                <div className="flex-1 text-center py-2 font-black text-sm">{bidAmount.toLocaleString()}</div>
                <button
                  onClick={() => adjustBid(1000)}
                  disabled={!isMyTurn}
                  className="px-3 bg-slate-200 hover:bg-slate-300 font-black text-lg disabled:opacity-40"
                >+</button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onBid(bidAmount)}
                disabled={!canBid}
                className="flex-1 py-3 bg-green-400 hover:bg-green-300 disabled:bg-slate-300 disabled:cursor-not-allowed border-4 border-black rounded-xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all text-sm"
              >
                베팅하기 ({bidAmount.toLocaleString()})
              </button>
              <button
                onClick={onPass}
                disabled={!canPass}
                className="flex-1 py-3 bg-red-400 hover:bg-red-300 disabled:bg-slate-300 disabled:cursor-not-allowed border-4 border-black rounded-xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all text-sm"
              >
                {isMustBid ? '포기 불가!' : '포기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
