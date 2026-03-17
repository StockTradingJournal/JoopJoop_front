import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Eye, Timer, HelpCircle, Check, X } from 'lucide-react';
import { GameState, Player, ItemType, PeekResult } from '../../lib/socket-types';
import { playClick, playTick, playPaperRustle } from '../../lib/audio';

// ── Real estate card data ────────────────────────────────────────────────────
const REAL_ESTATE_DATA: Record<number, { title: string; emoji: string; color: string }> = {
  1:  { title: '바선생 반지하', emoji: '🪳', color: '#8c8273' },
  2:  { title: '달동네 판자집', emoji: '🏚️', color: '#9ca3af' },
  3:  { title: '초가집', emoji: '🛖', color: '#d97706' },
  4:  { title: '24시 찜질방', emoji: '♨️', color: '#fca5a5' },
  5:  { title: '고시원', emoji: '🛏️', color: '#d1d5db' },
  6:  { title: '해방촌 옥탑방', emoji: '🌃', color: '#93c5fd' },
  7:  { title: '노엘베 빌라', emoji: '🧱', color: '#d6d3d1' },
  8:  { title: '단독주택', emoji: '🏡', color: '#86efac' },
  9:  { title: '주상복합 오피스텔', emoji: '🏢', color: '#cbd5e1' },
  10: { title: '구축 아파트', emoji: '🏢', color: '#9ca3af' },
  11: { title: '역세권 아파트', emoji: '🚉', color: '#3b82f6' },
  12: { title: '동탄 신도시', emoji: '🏙️', color: '#a78bfa' },
  13: { title: '반포 자이', emoji: '⛲', color: '#fde047' },
  14: { title: '현대 아이파크', emoji: '💎', color: '#c084fc' },
  15: { title: '한남 더 힐', emoji: '🏰', color: '#f43f5e' },
};

// ── Job card data ─────────────────────────────────────────────────────────────
const JOB_EMOJIS: Record<number, string> = {
  1:'📦', 2:'🚲', 3:'🏪', 4:'🎨', 5:'👔', 6:'🛵', 7:'🖨️', 8:'💻',
  9:'🎧', 10:'🏢', 11:'🏫', 12:'🏦', 13:'📝', 14:'💼', 15:'💉',
  16:'🏭', 17:'⌨️', 18:'📊', 19:'💊', 20:'📜', 21:'⚖️', 22:'🩺',
  23:'📈', 24:'🎥', 25:'🏥', 26:'🦄', 27:'🚀', 28:'⭐', 29:'👑', 30:'🏙️',
};
const JOB_COLORS: Record<number, string> = {
  1:'#e2dac9', 2:'#b7d6e6', 3:'#6a90c9', 4:'#d4b48e', 5:'#b9c2db',
  6:'#f5dd76', 7:'#d1d5db', 8:'#e8dcc5', 9:'#fbcfe8', 10:'#f3f4f6',
  11:'#bce3c4', 12:'#bae6fd', 13:'#fcd34d', 14:'#f8fafc', 15:'#99f6e4',
  16:'#bfdbfe', 17:'#cbd5e1', 18:'#93c5fd', 19:'#ecfdf5', 20:'#fef08a',
  21:'#d6d3d1', 22:'#5eead4', 23:'#fcd34d', 24:'#fee2e2', 25:'#ffe4e6',
  26:'#e0e7ff', 27:'#86efac', 28:'#e879f9', 29:'#a1a1aa', 30:'#7dd3fc',
};

const ITEM_META = {
  reroll: { icon: RefreshCw, color: 'bg-blue-400', name: '리롤' },
  peek:   { icon: Eye,       color: 'bg-purple-400', name: '엿보기' },
};

const AVATAR_COLORS = [
  'bg-yellow-300', 'bg-pink-300', 'bg-cyan-300',
  'bg-green-300', 'bg-purple-300', 'bg-orange-300',
];
const AVATARS = ['🧑', '👩', '🧔', '👱', '🧕', '👴'];

// ── Sub-components ───────────────────────────────────────────────────────────

// 부동산 카드: 2열 그리드 배치, 라운드키+인덱스로 등장 애니메이션
function RealEstateCard({
  id, animIndex = 0, roundKey = 0,
}: {
  id: number; animIndex?: number; roundKey?: number;
}) {
  const d = REAL_ESTATE_DATA[id] || { title: '?', emoji: '❓', color: '#fff' };
  const value = id * 1000;

  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), animIndex * 100 + 30);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundKey, animIndex]);

  return (
    <div
      className="relative border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col w-full h-full"
      style={{
        backgroundColor: d.color,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1) rotate(0deg)' : 'translateY(22px) scale(0.82) rotate(-4deg)',
        transition: `opacity 0.25s ease ${animIndex * 0.08}s, transform 0.35s cubic-bezier(0.34,1.5,0.64,1) ${animIndex * 0.08}s`,
      }}
    >
      <div className="absolute top-1 right-1.5 bg-black text-white font-black text-[9px] px-1.5 py-0.5 rounded-full">#{id}</div>
      <div className="flex-1 flex items-center justify-center text-3xl pt-2">{d.emoji}</div>
      <div className="bg-white border-t-[3px] border-black px-1 flex flex-col items-center justify-center rounded-b-xl h-[2.6rem] shrink-0">
        <span className="font-black text-[8px] text-center leading-snug w-full break-keep"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >{d.title}</span>
        <span className="font-black text-blue-600 text-[9px] whitespace-nowrap">{value.toLocaleString()}원</span>
      </div>
    </div>
  );
}

function RealEstateCardMini({ id }: { id: number }) {
  const d = REAL_ESTATE_DATA[id] || { title: '?', emoji: '❓', color: '#fff' };
  const value = id * 1000;
  return (
    <div
      className="relative flex-none w-11 h-[4.2rem] border-2 border-black rounded-lg flex flex-col overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
      style={{ backgroundColor: d.color }}
    >
      <div className="absolute top-0.5 right-1 text-[7px] font-black text-white drop-shadow">{id}</div>
      <div className="flex-1 flex items-center justify-center text-sm">{d.emoji}</div>
      <div className="bg-white border-t-2 border-black text-[7px] font-black text-center truncate px-0.5 py-0.5 text-blue-600">
        {value.toLocaleString()}원
      </div>
    </div>
  );
}

function JobCardMini({ id, onClick }: { id: number; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: JOB_COLORS[id] ?? '#fff' }}
      className="relative flex-none w-12 h-[4.5rem] border-2 border-black rounded-lg flex flex-col overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform cursor-pointer hover:-translate-y-1 active:-translate-y-2"
    >
      <div className="absolute top-0.5 left-1 text-[7px] font-black opacity-60">{id}</div>
      <div className="flex-1 flex items-center justify-center text-base drop-shadow">{JOB_EMOJIS[id] ?? '❓'}</div>
      <div className="bg-white border-t-2 border-black text-[7px] font-black text-center py-0.5 truncate px-0.5">{id}번</div>
    </div>
  );
}

function useTimeLeft(startTime: number, timeout: number): number {
  const [timeLeft, setTimeLeft] = useState(timeout);
  useEffect(() => {
    const update = () => {
      const elapsed = Date.now() / 1000 - startTime;
      setTimeLeft(Math.max(0, Math.ceil(timeout - elapsed)));
    };
    update();
    const id = setInterval(update, 200);
    return () => clearInterval(id);
  }, [startTime, timeout]);
  return timeLeft;
}

function PeekModal({
  opponents,
  onSelect,
  onCancel,
}: {
  opponents: Player[];
  onSelect: (id: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black rounded-3xl p-5 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-black">누구의 부동산을 엿볼까요?</h3>
          <button onClick={onCancel}><X className="w-5 h-5" /></button>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          {opponents.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="flex flex-col items-center p-3 border-4 border-black rounded-xl hover:bg-slate-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 font-black"
            >
              <div className={`w-10 h-10 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} rounded-full border-4 border-black flex items-center justify-center text-lg mb-1.5`}>
                {AVATARS[idx % AVATARS.length]}
              </div>
              <span className="text-xs">{p.nickname}</span>
              <span className="text-[10px] font-bold text-slate-500 mt-0.5">🏠 {p.realEstateCount}장</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Dealt job card slot (no fly animation — just state display) ───────────────
function DealtCardSlot({
  player,
  playerIndex,
  selectedProperty,
  allRevealed,
  slim,
}: {
  player: Player;
  playerIndex: number;
  selectedProperty: number | null;
  allRevealed: boolean;
  slim: boolean;
}) {
  const isSubmitted = player.hasSelected || selectedProperty !== null;
  const cardW = slim ? 'w-9'        : 'w-11';
  const cardH = slim ? 'h-[3.4rem]' : 'h-[4.2rem]';

  return (
    <div className={`relative flex-none ${cardW} ${cardH}`}>
      {allRevealed && selectedProperty ? (
        <div
          className="w-full h-full border-2 border-black rounded-lg flex flex-col overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          style={{ backgroundColor: JOB_COLORS[selectedProperty] ?? '#fff' }}
        >
          <div className="flex-1 flex items-center justify-center text-sm">{JOB_EMOJIS[selectedProperty] ?? '?'}</div>
          <div className="bg-white border-t border-black text-[6px] font-black text-center py-0.5">{selectedProperty}번</div>
        </div>
      ) : isSubmitted ? (
        <div className="w-full h-full bg-slate-800 border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Check className={slim ? 'w-3 h-3 text-green-400' : 'w-3.5 h-3.5 text-green-400'} />
        </div>
      ) : (
        <div className="w-full h-full bg-slate-100 border border-dashed border-slate-400 rounded-lg flex items-center justify-center">
          <span className="text-slate-400 text-[7px] font-bold text-center leading-tight px-0.5">대기</span>
        </div>
      )}
      {/* Avatar badge */}
      <div className={`absolute -top-1.5 -left-0.5 w-3.5 h-3.5 ${AVATAR_COLORS[playerIndex % AVATAR_COLORS.length]} rounded-full border border-black flex items-center justify-center text-[7px] shadow-sm`}>
        {AVATARS[playerIndex % AVATARS.length]}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface Phase2ScreenProps {
  gameState: GameState;
  currentPlayerId: string;
  activePeek: PeekResult | null;
  onPlayCard: (cardId: number) => void;
  onUseItemReroll: () => void;
  onUseItemPeek: (targetId: string) => void;
}

// 부동산 카드 획득 애니메이션 타입 (Phase1의 winFly와 동일 구조)
interface EstateWinFly {
  cardId: number;
  startX: number;
  startY: number;
  flyX: string;
  flyY: string;
  phase: 'shine' | 'fly';
}

export function Phase2Screen({
  gameState,
  currentPlayerId,
  activePeek,
  onPlayCard,
  onUseItemReroll,
  onUseItemPeek,
}: Phase2ScreenProps) {
  const [showPeekSelect, setShowPeekSelect] = useState(false);
  // roundKey: 라운드가 바뀔 때마다 부동산 카드를 리마운트해 애니메이션 재실행
  const [roundKey, setRoundKey] = useState(gameState.phase2RoundNumber);
  const prevRound = useRef(gameState.phase2RoundNumber);
  // 공개 애니메이션: allPlayersSelected가 true가 되는 순간 각 플레이어 카드에 순차 애니메이션
  const [revealedPlayers, setRevealedPlayers] = useState<Set<string>>(new Set());
  const prevAllSelectedRef = useRef(gameState.allPlayersSelected);
  const revealTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // 부동산 카드 획득 shine→fly 애니메이션
  const [estateWinFly, setEstateWinFly] = useState<EstateWinFly | null>(null);
  const estateWinFlyTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevRealEstateCardsRef = useRef<number[]>(
    gameState.players.find((p) => p.id === currentPlayerId)?.realEstateCards ?? []
  );
  // 내 부동산 카운트 뱃지 ref (fly 목적지)
  const myEstateBadgeRef = useRef<HTMLSpanElement>(null);

  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameState.phase2RoundNumber !== prevRound.current) {
      prevRound.current = gameState.phase2RoundNumber;
      setRoundKey(gameState.phase2RoundNumber);
      setRevealedPlayers(new Set());
      prevAllSelectedRef.current = false;
    }
  }, [gameState.phase2RoundNumber]);

  // 전원 제출 완료 시 각 플레이어 카드를 순차적으로 공개 애니메이션
  useEffect(() => {
    if (!gameState.allPlayersSelected || prevAllSelectedRef.current) return;
    prevAllSelectedRef.current = true;
    revealTimersRef.current.forEach(clearTimeout);
    revealTimersRef.current = [];
    const newRevealed = new Set<string>();
    gameState.players.forEach((player, i) => {
      const t = setTimeout(() => {
        newRevealed.add(player.id);
        setRevealedPlayers(new Set(newRevealed));
      }, i * 150);
      revealTimersRef.current.push(t);
    });
    return () => revealTimersRef.current.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.allPlayersSelected]);

  // 내 realEstateCards가 새로 추가될 때 획득 애니메이션 실행
  useEffect(() => {
    const me = gameState.players.find((p) => p.id === currentPlayerId);
    const current = me?.realEstateCards ?? [];
    const prev = prevRealEstateCardsRef.current;
    const newCards = current.filter((c) => !prev.includes(c));
    prevRealEstateCardsRef.current = current;
    if (newCards.length === 0) return;

    const cardId = newCards[newCards.length - 1];
    estateWinFlyTimersRef.current.forEach(clearTimeout);
    estateWinFlyTimersRef.current = [];

    const badgeEl = myEstateBadgeRef.current;
    const flyX = badgeEl
      ? `${badgeEl.getBoundingClientRect().left + badgeEl.getBoundingClientRect().width / 2 - window.innerWidth / 2}px`
      : '0px';
    const flyY = badgeEl
      ? `${badgeEl.getBoundingClientRect().top + badgeEl.getBoundingClientRect().height / 2 - window.innerHeight / 2}px`
      : '0px';

    setEstateWinFly({ cardId, startX: window.innerWidth / 2, startY: window.innerHeight / 2, flyX, flyY, phase: 'shine' });
    estateWinFlyTimersRef.current.push(
      setTimeout(() => setEstateWinFly((p) => p ? { ...p, phase: 'fly' } : null), 1200),
      setTimeout(() => { setEstateWinFly(null); estateWinFlyTimersRef.current = []; }, 2000),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.players, currentPlayerId]);

  const PHASE2_TIMEOUT_SECONDS = 10;
  const timeLeft = useTimeLeft(gameState.phase2StartTime, PHASE2_TIMEOUT_SECONDS);
  const prevTimeLeftRef = useRef<number>(timeLeft);

  // 타이머 1초마다 틱 사운드 (마지막 3초는 긴장 버전)
  useEffect(() => {
    if (timeLeft <= 0 || timeLeft > PHASE2_TIMEOUT_SECONDS) return;
    if (prevTimeLeftRef.current !== timeLeft) {
      const prev = prevTimeLeftRef.current;
      prevTimeLeftRef.current = timeLeft;
      if (timeLeft < prev) playTick(timeLeft <= 3);
    }
  }, [timeLeft, PHASE2_TIMEOUT_SECONDS]);


  const me = gameState.players.find((p) => p.id === currentPlayerId);
  const opponents = gameState.players.filter((p) => p.id !== currentPlayerId);
  const myItem = gameState.playerItems[currentPlayerId];
  const isSelecting = !gameState.allPlayersSelected;

  const canReroll = !myItem?.used && myItem?.item === 'reroll' && !me?.hasSelected && isSelecting;
  const canPeek = !myItem?.used && myItem?.item === 'peek' && isSelecting;

  const handleUseItem = (type: ItemType) => {
    if (type === 'reroll' && canReroll) { playPaperRustle(); onUseItemReroll(); }
    else if (type === 'peek' && canPeek) { playClick(); setShowPeekSelect(true); }
  };

  const handlePlayCard = (cardId: number) => {
    if (!isSelecting || me?.hasSelected) return;
    playClick();
    onPlayCard(cardId);
  };

  const playerIndex = (id: string) => gameState.players.findIndex((p) => p.id === id);

  return (
    <div
      className="h-screen max-h-screen flex flex-col font-sans relative overflow-hidden"
      style={{
        backgroundColor: '#e0e7ff',
        backgroundImage: 'radial-gradient(#c7d2fe 20%, transparent 20%), radial-gradient(#c7d2fe 20%, transparent 20%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px',
      }}
    >
      {/* Peek select modal */}
      {showPeekSelect && (
        <PeekModal
          opponents={opponents}
          onSelect={(id) => { playClick(); setShowPeekSelect(false); onUseItemPeek(id); }}
          onCancel={() => setShowPeekSelect(false)}
        />
      )}

      {/* 부동산 카드 획득 shine→fly 오버레이 (Phase1의 winFly와 동일 패턴) */}
      {estateWinFly && (() => {
        const d = REAL_ESTATE_DATA[estateWinFly.cardId] || { title: '?', emoji: '❓', color: '#fff' };
        const isShine = estateWinFly.phase === 'shine';
        const value = estateWinFly.cardId * 1000;
        return (
          <>
            {/* shine 단계: 화면 중앙에 크게 표시 */}
            {isShine && (
              <div
                className="fixed inset-0 z-[65] flex items-center justify-center pointer-events-none"
                style={{ animation: 'cardWinShine 0.6s ease-out forwards' }}
              >
                <div className="flex flex-col items-center gap-3">
                  <span className="font-black text-xl animate-bounce text-yellow-400 drop-shadow-lg">
                    🏠 부동산 획득!
                  </span>
                  <div
                    className="relative w-28 h-40 border-4 border-black rounded-2xl flex flex-col overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                    style={{ backgroundColor: d.color }}
                  >
                    <div className="absolute top-1 right-2 bg-black text-white font-black text-[9px] px-1.5 py-0.5 rounded-full">#{estateWinFly.cardId}</div>
                    <div className="flex-1 flex items-center justify-center text-5xl pt-2">{d.emoji}</div>
                    <div className="bg-white border-t-[3px] border-black px-1 flex flex-col items-center justify-center rounded-b-xl py-1 shrink-0">
                      <span className="font-black text-[10px] text-center leading-snug">{d.title}</span>
                      <span className="font-black text-blue-600 text-[11px]">{value.toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* fly 단계: 중앙에서 내 부동산 뱃지로 날아감 */}
            {!isShine && (
              <div
                className="fixed z-[70] pointer-events-none"
                style={{
                  left: estateWinFly.startX - 40,
                  top: estateWinFly.startY - 56,
                  width: 80,
                  height: 112,
                  '--fly-x': estateWinFly.flyX,
                  '--fly-y': estateWinFly.flyY,
                  animation: 'cardFlyToBtn 0.7s cubic-bezier(0.4, 0, 0.8, 0.6) forwards',
                } as React.CSSProperties}
              >
                <div
                  className="w-full h-full border-4 border-black rounded-2xl flex flex-col overflow-hidden shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                  style={{ backgroundColor: d.color }}
                >
                  <div className="flex-1 flex items-center justify-center text-3xl pt-1">{d.emoji}</div>
                  <div className="bg-white border-t-2 border-black text-[9px] font-black text-center py-0.5 truncate px-0.5">{d.title}</div>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* Peek result toast */}
      {activePeek && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-purple-400 border-4 border-black rounded-2xl p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-[calc(100vw-2rem)] max-w-xs">
          <Eye className="w-6 h-6 mx-auto mb-1 text-white" />
          <p className="font-black text-white text-xs mb-2 text-center">
            👁️ {activePeek.targetNickname}의 최고가 직업 카드
          </p>
          <div className="flex justify-center">
            {activePeek.topJobCard == null ? (
              <span className="text-white font-bold text-xs">보유 직업 카드 없음</span>
            ) : (
              <div
                className="w-16 h-[5.5rem] border-3 border-black rounded-xl flex flex-col overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                style={{ backgroundColor: JOB_COLORS[activePeek.topJobCard] ?? '#fff', border: '3px solid black' }}
              >
                <div className="flex-1 flex items-center justify-center text-2xl drop-shadow">
                  {JOB_EMOJIS[activePeek.topJobCard] ?? '❓'}
                </div>
                <div className="bg-white border-t-2 border-black text-[9px] font-black text-center py-0.5">
                  {activePeek.topJobCard}번
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TOP: compact player grid (max 6 = 3×2 or 2×n) ───────────────── */}
      <div className="flex-none bg-white/80 border-b-4 border-black">
        <div className="flex items-center justify-between px-3 pt-2 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-black text-white px-2 py-0.5 rounded-full text-[10px] font-black">Phase 2</span>
            <span className="font-black text-xs text-slate-700">라운드 {gameState.phase2RoundNumber}</span>
          </div>
          {isSelecting && (
            <div className="flex items-center gap-1 bg-white border-2 border-black rounded-full px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <Timer className="w-3 h-3 text-red-500 animate-pulse" />
              <span className={`font-black text-xs ${timeLeft <= 3 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                {timeLeft}s
              </span>
            </div>
          )}
        </div>

        {/* 2열 그리드: 홀수명일 때 마지막 1명 중앙 배치 */}
        {(() => {
          const players = gameState.players;
          const isOdd = players.length % 2 !== 0;
          const pairs = isOdd ? players.slice(0, players.length - 1) : players;
          const last = isOdd ? players[players.length - 1] : null;

          const renderPlayerCard = (player: Player) => {
            const idx = playerIndex(player.id);
            const pi = gameState.playerItems[player.id];
            const piMeta = pi?.item && pi.item !== 'reverse' ? ITEM_META[pi.item as 'reroll' | 'peek'] : null;
            const isMe = player.id === currentPlayerId;
            return (
              <div
                key={player.id}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  isMe ? 'bg-blue-100' : 'bg-white'
                }`}
              >
                <div className={`relative w-6 h-6 flex-none ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} rounded-full border-2 border-black flex items-center justify-center text-xs`}>
                  {AVATARS[idx % AVATARS.length]}
                  {piMeta && (
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 ${piMeta.color} ${pi?.used ? 'grayscale opacity-60' : ''} rounded-full border border-black flex items-center justify-center`}>
                      {(() => { const Icon = piMeta.icon; return <Icon className="w-1.5 h-1.5 text-white" />; })()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col leading-none gap-0.5 min-w-0">
                  <span className="font-black text-[10px] text-slate-800 truncate">
                    {player.nickname}{isMe && <span className="text-blue-500">●</span>}
                  </span>
                  {player.hasSelected ? (
                    <span className="text-[9px] font-black text-green-600 flex items-center gap-0.5">
                      <Check className="w-2 h-2" />제출
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400">고민중</span>
                  )}
                </div>
              </div>
            );
          };

          return (
            <div className="px-3 pb-2 flex flex-col gap-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                {pairs.map(renderPlayerCard)}
              </div>
              {last && (
                <div className="flex justify-center">
                  <div className="w-[calc(50%-0.375rem)]">
                    {renderPlayerCard(last)}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ── CENTER: board area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col px-3 pt-3 pb-2 min-h-0 justify-between">

        {/* ① 섹션 라벨 */}
        <div className="flex-none flex items-center justify-between mb-2">
          <span className="text-[9px] font-black text-slate-500 bg-white/70 px-2 py-0.5 rounded-full border border-slate-300">
            🏠 이번 라운드 부동산
          </span>
          {gameState.allPlayersSelected && (
            <span className="text-[9px] font-black text-yellow-600 bg-yellow-100 border border-yellow-300 px-2 py-0.5 rounded-full animate-pulse">
              🎉 카드 공개!
            </span>
          )}
        </div>

        {/* ② 부동산 카드 그리드 + 덱 — 항상 2행 높이 공간 확보 */}
        {(() => {
          const cards = gameState.currentRealEstateCards;
          const n = cards.length;
          let topRow: number[];
          let bottomRow: number[];
          if (n >= 6) {
            topRow = cards.slice(0, 3);
            bottomRow = cards.slice(3, 6);
          } else if (n === 5) {
            topRow = cards.slice(0, 3);
            bottomRow = cards.slice(3, 5);
          } else if (n === 4) {
            topRow = cards.slice(0, 2);
            bottomRow = cards.slice(2, 4);
          } else {
            topRow = cards;
            bottomRow = [];
          }

          // 카드 크기는 항상 6인 기준으로 고정
          const cardW = 'w-[4.5rem]';
          const cardH = 'h-[6.5rem]';

          const renderRow = (row: number[], startIdx: number) => (
            <div className="flex gap-2 justify-center">
              {row.map((id, i) => (
                <div key={`${roundKey}-${id}`} className={`${cardW} ${cardH} flex-none`}>
                  <RealEstateCard id={id} animIndex={startIdx + i} roundKey={roundKey} />
                </div>
              ))}
            </div>
          );

          // 2행 높이를 항상 확보: 카드 2행 + gap
          const twoRowH = 'h-[14rem]';

          return (
            <div className={`flex-none flex gap-3 items-center justify-center ${twoRowH}`}>
              {/* 카드 그리드 */}
              <div className="flex flex-col gap-2 justify-center h-full">
                {renderRow(topRow, 0)}
                {bottomRow.length > 0 && renderRow(bottomRow, topRow.length)}
              </div>

              {/* 직업 카드 더미 */}
              <div className="flex-none self-center">
                <div ref={deckRef} className={`relative ${cardW} ${cardH}`}>
                  {[3, 2, 1].map((o) => (
                    <div
                      key={o}
                      className="absolute inset-0 rounded-2xl border-2 border-black"
                      style={{
                        backgroundColor: '#c4a882',
                        transform: `translate(${o * 2}px,${-o * 2}px)`,
                      }}
                    />
                  ))}
                  <div
                    className="absolute inset-0 rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-1"
                    style={{ backgroundColor: '#d4b896' }}
                  >
                    <span className="text-2xl">🏠</span>
                    <span className="text-black font-black text-[9px]">직업카드</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ③ 플레이어 제출 현황 — 고정 크기, 항상 6인 기준 슬롯 */}
        <div className="flex-none bg-white/60 border-2 border-black/20 rounded-2xl px-3 py-2.5 mt-2">
          <div className="text-[8px] font-black text-slate-400 mb-2">카드 제출 현황</div>
          <div className="flex justify-around gap-1">
            {gameState.players.map((player) => {
              const idx = playerIndex(player.id);
              const isMe = player.id === currentPlayerId;
              const submitted = player.hasSelected;
              const isRevealed = revealedPlayers.has(player.id);
              return (
                <div key={player.id} className="flex flex-col items-center gap-1 flex-1">
                  {/* 제출 카드 or 대기 슬롯 — 항상 고정 크기 */}
                  {gameState.allPlayersSelected && player.selectedProperty ? (
                    <div
                      className={`w-9 h-[3.5rem] border-2 border-black rounded-lg flex flex-col overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]${isRevealed ? ' phase2-card-reveal' : ''}`}
                      style={{ backgroundColor: JOB_COLORS[player.selectedProperty] ?? '#fff' }}
                    >
                      <div className="flex-1 flex items-center justify-center text-sm">{JOB_EMOJIS[player.selectedProperty] ?? '?'}</div>
                      <div className="bg-white border-t border-black text-[6px] font-black text-center py-0.5">{player.selectedProperty}번</div>
                    </div>
                  ) : submitted ? (
                    <div className="w-9 h-[3.5rem] bg-slate-800 border-2 border-black rounded-lg flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-9 h-[3.5rem] bg-slate-100 border border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                      <span className="text-slate-300 text-[8px] font-bold">대기</span>
                    </div>
                  )}
                  {/* 아바타 + 닉네임 */}
                  <div className="flex flex-col items-center gap-0.5">
                    <div className={`relative w-5 h-5 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} rounded-full border border-black flex items-center justify-center text-[10px]`}>
                      {AVATARS[idx % AVATARS.length]}
                      {submitted && !gameState.allPlayersSelected && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-black flex items-center justify-center">
                          <Check className="w-1.5 h-1.5 text-white" />
                        </div>
                      )}
                    </div>
                    <span className={`text-[7px] font-black max-w-[2.8rem] truncate text-center ${isMe ? 'text-blue-600' : submitted ? 'text-slate-600' : 'text-slate-400'}`}>
                      {player.nickname}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ④ 공개 배너 (전원 제출 후) */}
        {gameState.allPlayersSelected ? (
          <div className="flex-none pt-2">
            <div className="bg-yellow-400 border-4 border-black rounded-2xl px-3 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-center text-xs animate-bounce">
              🎉 높은 직업 카드가 우선권을 갖습니다!
            </div>
          </div>
        ) : (
          <div className="flex-none" />
        )}
      </div>

      {/* ── BOTTOM: my panel ──────────────────────────────────────────────── */}
      <div className="flex-none border-t-4 border-black bg-slate-50 px-3 pt-2.5 pb-3">

        {/* Item row */}
        {myItem?.item && myItem.item !== 'reverse' && (() => {
          const itemId = myItem.item as 'reroll' | 'peek';
          const meta = ITEM_META[itemId];
          const Icon = meta.icon;
          const usable = itemId === 'reroll' ? canReroll : canPeek;
          return (
            <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-dashed border-slate-200">
              <div className="flex items-center gap-1 text-xs font-black text-slate-500">
                <HelpCircle className="w-3.5 h-3.5" />내 아이템
              </div>
              <button
                onClick={() => handleUseItem(itemId)}
                disabled={!usable}
                className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black rounded-full font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform ${
                  myItem.used
                    ? 'bg-slate-300 grayscale line-through text-slate-500'
                    : usable
                    ? `${meta.color} hover:-translate-y-0.5 active:-translate-y-0.5`
                    : `${meta.color} opacity-40 cursor-not-allowed`
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-black" />
                {meta.name} 사용
              </button>
            </div>
          );
        })()}

        {/* My info + card selection row */}
        <div className="flex items-start gap-2">
          {/* My avatar + real estate count */}
          <div className="flex-none flex flex-col items-center gap-1 pt-1">
            <div className={`w-9 h-9 ${AVATAR_COLORS[playerIndex(currentPlayerId) % AVATAR_COLORS.length]} rounded-full border-2 border-black flex items-center justify-center text-lg`}>
              {AVATARS[playerIndex(currentPlayerId) % AVATARS.length]}
            </div>
            <span ref={myEstateBadgeRef} className="text-[9px] font-black text-slate-500">🏠 {me?.realEstateCount ?? 0}장</span>
          </div>

          {/* Card selection area */}
          <div className="flex-1 min-w-0">
            {me?.hasSelected ? (
              <div className="bg-green-100 border-2 border-green-400 rounded-xl px-3 py-3 text-center">
                <p className="font-black text-green-700 text-xs">✅ 카드 제출 완료!</p>
                <p className="font-bold text-green-600 text-[10px] mt-0.5">다른 플레이어 대기 중...</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-black text-[11px] bg-black text-white px-2.5 py-0.5 rounded-full">제출할 직업 카드</span>
                  <span className="text-[9px] text-slate-400 font-bold">탭하면 제출</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto hide-scrollbar py-1">
                  {(me?.properties.length ?? 0) === 0 ? (
                    <span className="text-xs font-bold text-slate-400 self-center py-2">보유 카드 없음</span>
                  ) : (
                    [...(me?.properties ?? [])].sort((a, b) => a - b).map((c) => (
                      <JobCardMini
                        key={c}
                        id={c}
                        onClick={() => handlePlayCard(c)}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
