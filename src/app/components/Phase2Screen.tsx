import { useState, useEffect } from 'react';
import { RefreshCw, Eye, Timer, HelpCircle, Check, X, ArrowRight } from 'lucide-react';
import { GameState, Player, ItemType, PeekResult } from '../../lib/socket-types';

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

// ── Job card data (mini) ─────────────────────────────────────────────────────
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
  peek:   { icon: Eye, color: 'bg-purple-400', name: '엿보기' },
};

const AVATARS = ['🧑', '👩', '🧔', '👱', '🧕', '👴'];
const AVATAR_COLORS = [
  'bg-yellow-300', 'bg-pink-300', 'bg-cyan-300',
  'bg-green-300', 'bg-purple-300', 'bg-orange-300',
];

// ── Sub-components ───────────────────────────────────────────────────────────

function RealEstateCard({ id, mini = false }: { id: number; mini?: boolean }) {
  const d = REAL_ESTATE_DATA[id] || { title: '?', emoji: '❓', color: '#fff' };
  const value = id * 1000;
  if (mini) {
    return (
      <div
        className="flex-none w-14 h-20 border-2 border-black rounded-lg flex flex-col overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        style={{ backgroundColor: d.color }}
      >
        <div className="absolute top-0.5 right-1 text-[8px] font-black text-white drop-shadow">{id}</div>
        <div className="flex-1 flex items-center justify-center text-lg">{d.emoji}</div>
        <div className="bg-white border-t-2 border-black text-[8px] font-black text-center truncate px-0.5 py-0.5 text-blue-600">
          {value.toLocaleString()}원
        </div>
      </div>
    );
  }
  return (
    <div
      className="relative w-24 h-36 border-4 border-black rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col hover:-translate-y-2 transition-transform"
      style={{ backgroundColor: d.color }}
    >
      <div className="absolute top-1 right-2 bg-black text-white font-black text-[10px] px-1.5 py-0.5 rounded-full">#{id}</div>
      <div className="flex-1 flex items-center justify-center text-4xl">{d.emoji}</div>
      <div className="bg-white border-t-4 border-black py-1 px-1 flex flex-col items-center rounded-b-lg h-14 justify-center">
        <span className="font-black text-[9px] text-center leading-tight">{d.title}</span>
        <span className="font-black text-blue-600 text-xs mt-0.5">{value.toLocaleString()}원</span>
      </div>
    </div>
  );
}

function JobCardMini({ id, isSelected = false, onClick }: { id: number; isSelected?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: JOB_COLORS[id] ?? '#fff' }}
      className={`flex-none w-14 h-20 border-2 border-black rounded-lg flex flex-col overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform cursor-pointer ${
        isSelected ? '-translate-y-3 ring-2 ring-blue-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'hover:-translate-y-1'
      }`}
    >
      <div className="absolute top-0.5 left-1 text-[8px] font-black opacity-60">{id}</div>
      <div className="flex-1 flex items-center justify-center text-lg drop-shadow">{JOB_EMOJIS[id] ?? '❓'}</div>
      <div className="bg-white border-t-2 border-black text-[8px] font-black text-center py-0.5 truncate px-0.5">{id}번</div>
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
      <div className="bg-white border-4 border-black rounded-3xl p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black">누구의 부동산을 엿볼까요?</h3>
          <button onClick={onCancel}><X className="w-5 h-5" /></button>
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
              <span className="text-xs font-bold text-slate-500 mt-1">부동산 {p.realEstateCount}장</span>
            </button>
          ))}
        </div>
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

export function Phase2Screen({
  gameState,
  currentPlayerId,
  activePeek,
  onPlayCard,
  onUseItemReroll,
  onUseItemPeek,
}: Phase2ScreenProps) {
  const [showPeekSelect, setShowPeekSelect] = useState(false);
  /** 제출 중인 카드: 손에서 중앙 보드로 날아가는 애니메이션용 */
  const [flyingCard, setFlyingCard] = useState<{ cardId: number } | null>(null);

  /** Phase2 라운드 제한 시간(초). 서버에서도 동일 값(10)으로 설정해야 실제 종료 시점과 일치합니다. */
  const PHASE2_TIMEOUT_SECONDS = 10;
  const timeLeft = useTimeLeft(gameState.phase2StartTime, PHASE2_TIMEOUT_SECONDS);

  const me = gameState.players.find((p) => p.id === currentPlayerId);
  const opponents = gameState.players.filter((p) => p.id !== currentPlayerId);
  const myItem = gameState.playerItems[currentPlayerId];
  const isSelecting = !gameState.allPlayersSelected;

  const canReroll = !myItem?.used && myItem?.item === 'reroll' && !me?.hasSelected && isSelecting;
  const canPeek = !myItem?.used && myItem?.item === 'peek' && isSelecting;

  const handleUseItem = (type: ItemType) => {
    if (type === 'reroll' && canReroll) onUseItemReroll();
    else if (type === 'peek' && canPeek) setShowPeekSelect(true);
  };

  const handlePlayCard = (cardId: number) => {
    if (!isSelecting || me?.hasSelected) return;
    setFlyingCard({ cardId });
    onPlayCard(cardId);
    setTimeout(() => setFlyingCard(null), 850);
  };

  const playerIndex = (id: string) => gameState.players.findIndex((p) => p.id === id);

  return (
    <div
      className="min-h-screen flex flex-col font-sans relative"
      style={{
        backgroundColor: '#e0e7ff',
        backgroundImage: 'radial-gradient(#c7d2fe 20%, transparent 20%), radial-gradient(#c7d2fe 20%, transparent 20%)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
      }}
    >
      {/* 카드 제출 시 손 → 중앙 보드로 날아가며 뒷면으로 깔리는 애니메이션 */}
      {flyingCard && (
        <div className="phase2-flying-card-wrapper">
          <div className="phase2-flying-card-inner">
            <div
              className="phase2-flying-card-front flex flex-col overflow-hidden"
              style={{ backgroundColor: JOB_COLORS[flyingCard.cardId] ?? '#fff' }}
            >
              <div className="flex-1 flex items-center justify-center text-2xl">{JOB_EMOJIS[flyingCard.cardId] ?? '?'}</div>
              <div className="bg-white border-t-2 border-black text-[9px] font-black text-center py-0.5">{flyingCard.cardId}번</div>
            </div>
            <div className="phase2-flying-card-back">
              <Check className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      )}

      {/* Peek select modal */}
      {showPeekSelect && (
        <PeekModal
          opponents={opponents}
          onSelect={(id) => { setShowPeekSelect(false); onUseItemPeek(id); }}
          onCancel={() => setShowPeekSelect(false)}
        />
      )}

      {/* Peek result */}
      {activePeek && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-purple-400 border-4 border-black rounded-2xl p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full">
          <Eye className="w-8 h-8 mx-auto mb-1 text-white" />
          <p className="font-black text-white text-sm mb-2 text-center">
            👁️ {activePeek.targetNickname}의 부동산 카드
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {(activePeek.realEstateCards?.length ?? 0) === 0 ? (
              <span className="text-white font-bold text-sm">보유 부동산 없음</span>
            ) : (
              activePeek.realEstateCards?.map((c) => (
                <RealEstateCard key={c} id={c} mini />
              ))
            )}
          </div>
        </div>
      )}

      {/* Opponents area */}
      <div className="bg-slate-100 border-b-4 border-black p-4 flex justify-center gap-4 relative">
        <div className="absolute top-3 left-3">
          <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-black">Phase 2. 부동산 경매</span>
          <div className="mt-1 font-black text-sm">라운드 {gameState.phase2RoundNumber}</div>
        </div>

        {/* Timer */}
        {isSelecting && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white border-4 border-black rounded-full px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Timer className="w-4 h-4 text-red-500 animate-pulse" />
            <span className={`font-black text-sm ${timeLeft <= 3 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
              {timeLeft}s
            </span>
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          {opponents.map((player) => {
            const idx = playerIndex(player.id);
            const pi = gameState.playerItems[player.id];
            const piMeta = pi?.item && pi.item !== 'reverse' ? ITEM_META[pi.item as 'reroll' | 'peek'] : null;
            return (
              <div
                key={player.id}
                className="relative flex flex-col items-center p-3 border-4 border-black rounded-xl w-28 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className={`relative w-12 h-12 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} rounded-full border-4 border-black flex items-center justify-center text-xl mb-1`}>
                  {AVATARS[idx % AVATARS.length]}
                  {piMeta && (
                    <div className={`absolute -bottom-1 -left-1 w-6 h-6 ${piMeta.color} ${pi?.used ? 'grayscale opacity-70' : ''} rounded-full border-2 border-black flex items-center justify-center`}>
                      {(() => { const Icon = piMeta.icon; return <Icon className="w-3 h-3 text-white" />; })()}
                    </div>
                  )}
                </div>
                <span className="font-bold text-xs truncate w-full text-center">{player.nickname}</span>
                <div className="mt-1 w-full flex justify-center">
                  {player.hasSelected ? (
                    <span className="text-[10px] font-black bg-green-400 text-black px-2 py-0.5 rounded border-2 border-black flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> 제출 완료
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-2 py-0.5 rounded">
                      고민 중...
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-bold mt-0.5">부동산 {player.realEstateCount}장</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center board */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-blue-50 relative">
        {/* Real estate cards on table */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-28 bg-slate-800 border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-[-5deg]">
            <span className="text-white font-black text-[9px] text-center px-1 border border-white rounded p-0.5">부동산<br />카드</span>
          </div>
          <ArrowRight className="w-6 h-6 text-slate-400" />
          <div className="flex gap-2">
            {gameState.currentRealEstateCards.map((id) => (
              <RealEstateCard key={id} id={id} />
            ))}
          </div>
        </div>

        {/* Submitted job cards area */}
        <div className="relative bg-white/60 border-4 border-dashed border-black rounded-2xl p-4 w-full max-w-lg">
          <span className="absolute -top-3 left-4 bg-white px-2 font-black text-xs border-2 border-black rounded-full">
            제출된 직업 카드
          </span>
          <div className="flex gap-3 justify-center flex-wrap mt-2">
            {gameState.players.map((p) => {
              if (!p.hasSelected && p.selectedProperty === null) {
                return (
                  <div key={p.id} className="flex flex-col items-center gap-1">
                    <div className="w-16 h-24 border-4 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white/50">
                      <span className="text-slate-400 font-bold text-[10px] text-center px-1">{p.nickname}<br />대기중</span>
                    </div>
                  </div>
                );
              }
              return (
                <div key={p.id} className="flex flex-col items-center">
                  {gameState.allPlayersSelected && p.selectedProperty ? (
                    <div
                      className="w-16 h-24 border-4 border-black rounded-xl flex flex-col overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      style={{ backgroundColor: JOB_COLORS[p.selectedProperty] ?? '#fff' }}
                    >
                      <div className="flex-1 flex items-center justify-center text-2xl">{JOB_EMOJIS[p.selectedProperty] ?? '?'}</div>
                      <div className="bg-white border-t-2 border-black text-[9px] font-black text-center py-0.5">{p.selectedProperty}번</div>
                    </div>
                  ) : (
                    <div className="w-16 h-24 bg-slate-800 border-4 border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                      <Check className="w-6 h-6 text-green-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reveal banner */}
        {gameState.allPlayersSelected && (
          <div className="mt-4 bg-yellow-400 border-4 border-black rounded-2xl px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-center animate-bounce">
            🎉 카드 공개! 높은 직업 카드가 우선권을 갖습니다!
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="border-t-4 border-black p-4 flex flex-col gap-3 bg-slate-50">
        {/* Item panel */}
        {myItem?.item && myItem.item !== 'reverse' && (
          <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-3">
            <div className="flex items-center gap-1 font-black text-sm text-slate-600">
              <HelpCircle className="w-4 h-4" /> 내 아이템
            </div>
            {(() => {
              const itemId = myItem.item as 'reroll' | 'peek';
              const meta = ITEM_META[itemId];
              const Icon = meta.icon;
              const usable = itemId === 'reroll' ? canReroll : canPeek;
              return (
                <button
                  onClick={() => handleUseItem(itemId)}
                  disabled={!usable}
                  className={`flex items-center gap-2 px-4 py-2 border-4 border-black rounded-full font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform ${
                    myItem.used
                      ? 'bg-slate-300 grayscale line-through text-slate-500'
                      : usable
                      ? `${meta.color} hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
                      : `${meta.color} opacity-40 cursor-not-allowed`
                  }`}
                >
                  <Icon className="w-4 h-4 text-black" />
                  {meta.name} 사용하기
                </button>
              );
            })()}
          </div>
        )}

        {/* My info + card selection */}
        <div className="flex flex-col md:flex-row gap-4 items-start">
          {/* My stats */}
          <div className="flex flex-col gap-2 min-w-[160px]">
            <div className="flex items-center gap-2 bg-white border-4 border-black rounded-xl p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className={`w-10 h-10 ${AVATAR_COLORS[playerIndex(currentPlayerId) % AVATAR_COLORS.length]} rounded-full border-4 border-black flex items-center justify-center text-lg`}>
                {AVATARS[playerIndex(currentPlayerId) % AVATARS.length]}
              </div>
              <div>
                <div className="font-black text-sm">
                  {me?.nickname} <span className="text-[10px] bg-blue-500 text-white px-1 py-0.5 rounded-full">나</span>
                </div>
                <div className="text-xs font-bold text-slate-500">
                  잔여 현금: {me?.coins.toLocaleString()}원
                </div>
              </div>
            </div>
            {/* My real estate cards */}
            <div className="text-xs font-black text-slate-600 mb-1">내 부동산 ({me?.realEstateCount ?? 0}장)</div>
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
              {(me?.realEstateCards.length ?? 0) === 0 ? (
                <span className="text-xs text-slate-400 font-bold">없음</span>
              ) : (
                me?.realEstateCards.map((c) => <RealEstateCard key={c} id={c} mini />)
              )}
            </div>
          </div>

          {/* My job cards for selection */}
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <span className="font-black text-sm bg-black text-white px-3 py-1 rounded-full">
                제출할 직업 카드를 선택하세요
              </span>
              {me?.hasSelected && (
                <span className="text-green-600 font-black text-sm flex items-center gap-1">
                  <Check className="w-4 h-4" /> 제출 완료!
                </span>
              )}
            </div>

            {me?.hasSelected ? (
              <div className="bg-green-100 border-4 border-green-400 rounded-xl p-4 text-center">
                <p className="font-black text-green-700">카드를 제출했습니다!</p>
                <p className="font-bold text-green-600 text-sm">다른 플레이어를 기다리는 중...</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold text-slate-500 mb-1">카드를 클릭하면 바로 제출됩니다</p>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pt-2">
                  {(me?.properties.length ?? 0) === 0 ? (
                    <span className="text-sm font-bold text-slate-400 self-center">보유한 직업 카드 없음</span>
                  ) : (
                    me?.properties.map((c) => (
                      <JobCardMini
                        key={c}
                        id={c}
                        isSelected={false}
                        onClick={() => handlePlayCard(c)}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
