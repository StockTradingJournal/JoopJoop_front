import { useState, useEffect, useRef } from 'react';
import { Home, Medal, Crown, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { PlayerRanking } from '../../lib/socket-types';
import { playClick, playFanfare } from '../../lib/audio';

const INITIAL_CARDS_VISIBLE = 4;

const REAL_ESTATE_DATA: Record<number, { title: string; emoji: string }> = {
  1:  { title: '바선생 반지하', emoji: '🪳' },
  2:  { title: '달동네 판자집', emoji: '🏚️' },
  3:  { title: '초가집', emoji: '🛖' },
  4:  { title: '24시 찜질방', emoji: '♨️' },
  5:  { title: '고시원', emoji: '🛏️' },
  6:  { title: '해방촌 옥탑방', emoji: '🌃' },
  7:  { title: '노엘베 빌라', emoji: '🧱' },
  8:  { title: '단독주택', emoji: '🏡' },
  9:  { title: '주상복합 오피스텔', emoji: '🏢' },
  10: { title: '구축 아파트', emoji: '🏢' },
  11: { title: '역세권 아파트', emoji: '🚉' },
  12: { title: '동탄 신도시', emoji: '🏙️' },
  13: { title: '반포 자이', emoji: '⛲' },
  14: { title: '현대 아이파크', emoji: '💎' },
  15: { title: '한남 더 힐', emoji: '🏰' },
};

const AVATAR_COLORS = [
  'bg-yellow-300', 'bg-pink-300', 'bg-cyan-300',
  'bg-green-300', 'bg-purple-300', 'bg-orange-300',
];
const AVATARS = ['🧑', '👩', '🧔', '👱', '🧕', '👴'];

interface ResultScreenProps {
  rankings: PlayerRanking[];
  currentPlayerId: string;
  onBackToHome: () => void;
}

function MedalIcon({ rank }: { rank: number }) {
  const size = 'w-6 h-6 sm:w-8 sm:h-8';
  if (rank === 1) return <Medal className={`${size} text-yellow-500`} />;
  if (rank === 2) return <Medal className={`${size} text-slate-400`} />;
  if (rank === 3) return <Medal className={`${size} text-orange-400`} />;
  return <span className="font-black text-slate-600 text-base sm:text-xl w-6 sm:w-8 text-center">{rank}</span>;
}

export function ResultScreen({ rankings, currentPlayerId, onBackToHome }: ResultScreenProps) {
  const [expandedPlayerIds, setExpandedPlayerIds] = useState<Set<string>>(new Set());
  const fanfarePlayedRef = useRef(false);

  // 1등일 때 팡파르 1회만 재생
  useEffect(() => {
    if (fanfarePlayedRef.current || !rankings.length) return;
    const isFirst = rankings[0]?.playerId === currentPlayerId;
    if (isFirst) {
      fanfarePlayedRef.current = true;
      playFanfare();
    }
  }, [rankings, currentPlayerId]);

  const toggleCardsExpanded = (playerId: string) => {
    setExpandedPlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-3 py-4 sm:p-4 font-sans"
      style={{
        backgroundColor: '#ffedd5',
        backgroundImage: 'radial-gradient(#fed7aa 20%, transparent 20%), radial-gradient(#fed7aa 20%, transparent 20%)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
      }}
    >
      <div className="w-full max-w-2xl flex flex-col gap-3 sm:gap-4">
        {/* Header: 모바일 압축 */}
        <div className="text-center mb-2 sm:mb-4 relative">
          <Crown className="w-10 h-10 sm:w-16 sm:h-16 text-yellow-400 mx-auto mb-1 sm:mb-3 drop-shadow-md" />
          <h1
            className="text-2xl sm:text-5xl font-black text-orange-500"
            style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}
          >
            최종 자산 순위
          </h1>
          <p className="font-bold text-slate-600 mt-0.5 sm:mt-1 text-xs sm:text-base">누가 진정한 영끌 로드의 승자일까요?</p>
        </div>

        {/* Rankings: 모바일 컴팩트 */}
        <div className="flex flex-col gap-2 sm:gap-4 mb-2 sm:mb-6">
          {rankings.map((r, idx) => {
            const isMe = r.playerId === currentPlayerId;
            const isWinner = r.rank === 1;
            const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const avatar = AVATARS[idx % AVATARS.length];

            return (
              <div
                key={r.playerId}
                className={`relative flex items-center gap-2 sm:gap-4 p-2.5 sm:p-4 border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl transition-transform ${
                  isWinner
                    ? 'bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] scale-[1.02] sm:scale-105 z-10'
                    : 'bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                } ${isMe ? 'ring-2 sm:ring-4 ring-blue-400' : ''}`}
              >
                {isWinner && (
                  <div className="absolute -top-1.5 -right-1.5 sm:-top-3 sm:-right-3 bg-red-500 text-white font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border-2 border-black rotate-12 animate-pulse text-[10px] sm:text-sm">
                    우승! 🏆
                  </div>
                )}

                {/* Rank */}
                <div className="flex flex-col items-center min-w-[28px] sm:min-w-[40px] shrink-0">
                  <MedalIcon rank={r.rank} />
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 sm:w-14 sm:h-14 ${color} rounded-full border-2 sm:border-4 border-black flex items-center justify-center text-lg sm:text-2xl flex-shrink-0`}>
                  {avatar}
                </div>

                {/* Info: 모바일에서 한 줄 요약 */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className="font-black text-sm sm:text-lg flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="truncate">{r.nickname}</span>
                    {isMe && <span className="text-[10px] sm:text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full shrink-0">나</span>}
                  </div>

                  <div className="flex flex-wrap gap-x-2 gap-y-0 text-[10px] sm:text-sm font-bold text-slate-500 mt-0.5">
                    <span>현금 {r.remainingCoins.toLocaleString()}원</span>
                    <span className="hidden sm:inline">|</span>
                    <span>부동산 {r.estateValue.toLocaleString()}원</span>
                  </div>

                  {/* Real estate cards: 기본 4장만 표시, 더보기로 펼치기 */}
                  {r.realEstateCards.length > 0 && (() => {
                    const sortedCards = [...r.realEstateCards].sort((a, b) => b - a);
                    const isExpanded = expandedPlayerIds.has(r.playerId);
                    const visibleCards = isExpanded ? sortedCards : sortedCards.slice(0, INITIAL_CARDS_VISIBLE);
                    const hasMore = sortedCards.length > INITIAL_CARDS_VISIBLE;
                    const hiddenCount = sortedCards.length - INITIAL_CARDS_VISIBLE;
                    return (
                      <div className="mt-1 sm:mt-2">
                        <div className="flex gap-1 sm:gap-1.5 flex-wrap">
                          {visibleCards.map((c) => {
                            const d = REAL_ESTATE_DATA[c];
                            return (
                              <div key={c} className="flex items-center gap-0.5 bg-white border border-black sm:border-2 rounded px-1.5 py-0.5 sm:rounded-lg sm:px-2 sm:py-0.5 text-[10px] sm:text-xs font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <span>{d?.emoji ?? '🏠'}</span>
                                <span className="text-blue-600">{(c * 1000).toLocaleString()}원</span>
                              </div>
                            );
                          })}
                        </div>
                        {hasMore && (
                          <button
                            type="button"
                            onClick={() => toggleCardsExpanded(r.playerId)}
                            className="mt-1 flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-slate-500 hover:text-slate-700 active:opacity-70"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3 h-3" />
                                접기
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3" />
                                나머지 {hiddenCount}개 보기
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Final score */}
                <div className="text-right flex-shrink-0">
                  <div className="text-[9px] sm:text-xs font-bold text-slate-400 mb-0.5 sm:mb-1">최종 자산</div>
                  <div className={`font-black text-base sm:text-2xl tabular-nums ${isWinner ? 'text-red-500' : 'text-blue-600'}`}>
                    {r.finalScore.toLocaleString()}원
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Score explanation: 모바일 압축 */}
        <div className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl p-2.5 sm:p-4 mb-1 sm:mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-black text-xs sm:text-base mb-1 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 shrink-0" />
            점수 계산 방식
          </h3>
          <p className="font-bold text-[10px] sm:text-sm text-slate-600 leading-snug">
            최종 자산 = 잔여 현금 + 부동산 가치 (카드번호×1,000원)
          </p>
        </div>

        <button
          onClick={() => { playClick(); onBackToHome(); }}
          className="w-full py-3.5 sm:py-5 bg-blue-400 hover:bg-blue-300 text-black border-2 sm:border-4 border-black rounded-lg sm:rounded-xl font-black text-base sm:text-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 sm:active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5 sm:w-6 sm:h-6" />
          로비로 돌아가기
        </button>
      </div>
    </div>
  );
}
