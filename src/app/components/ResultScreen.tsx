import { Home, Medal, Crown, Trophy } from 'lucide-react';
import { PlayerRanking } from '../../lib/socket-types';

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
  if (rank === 1) return <Medal className="w-8 h-8 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-8 h-8 text-slate-400" />;
  if (rank === 3) return <Medal className="w-8 h-8 text-orange-400" />;
  return <span className="font-black text-slate-600 text-xl w-8 text-center">{rank}</span>;
}

export function ResultScreen({ rankings, currentPlayerId, onBackToHome }: ResultScreenProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 font-sans"
      style={{
        backgroundColor: '#ffedd5',
        backgroundImage: 'radial-gradient(#fed7aa 20%, transparent 20%), radial-gradient(#fed7aa 20%, transparent 20%)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6 relative">
          <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-3 drop-shadow-md" />
          <h1
            className="text-5xl font-black text-orange-500"
            style={{ textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}
          >
            최종 자산 순위
          </h1>
          <p className="font-bold text-slate-600 mt-1">누가 진정한 영끌 로드의 승자일까요?</p>
        </div>

        {/* Rankings */}
        <div className="flex flex-col gap-4 mb-6">
          {rankings.map((r, idx) => {
            const isMe = r.playerId === currentPlayerId;
            const isWinner = r.rank === 1;
            const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const avatar = AVATARS[idx % AVATARS.length];

            return (
              <div
                key={r.playerId}
                className={`relative flex items-start gap-4 p-4 border-4 border-black rounded-2xl transition-transform ${
                  isWinner
                    ? 'bg-yellow-100 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] scale-105 z-10'
                    : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                } ${isMe ? 'ring-4 ring-blue-400' : ''}`}
              >
                {isWinner && (
                  <div className="absolute -top-3 -right-3 bg-red-500 text-white font-black px-3 py-1 rounded-full border-2 border-black rotate-12 animate-pulse text-sm">
                    우승! 🏆
                  </div>
                )}

                {/* Rank */}
                <div className="flex flex-col items-center min-w-[40px]">
                  <MedalIcon rank={r.rank} />
                </div>

                {/* Avatar */}
                <div className={`w-14 h-14 ${color} rounded-full border-4 border-black flex items-center justify-center text-2xl flex-shrink-0`}>
                  {avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-black text-lg flex items-center gap-2 flex-wrap">
                    {r.nickname}
                    {isMe && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">나</span>}
                  </div>

                  <div className="flex gap-3 text-sm font-bold text-slate-500 mt-0.5 flex-wrap">
                    <span>잔여 현금: {r.remainingCoins.toLocaleString()}원</span>
                    <span>|</span>
                    <span>부동산 가치: {r.estateValue.toLocaleString()}원</span>
                  </div>

                  {/* Real estate cards */}
                  {r.realEstateCards.length > 0 && (
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {r.realEstateCards.sort((a, b) => b - a).map((c) => {
                        const d = REAL_ESTATE_DATA[c];
                        return (
                          <div key={c} className="flex items-center gap-0.5 bg-white border-2 border-black rounded-lg px-2 py-0.5 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <span>{d?.emoji ?? '🏠'}</span>
                            <span className="text-blue-600">{(c * 1000).toLocaleString()}원</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Final score */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-slate-400 mb-1">최종 자산</div>
                  <div className={`font-black text-2xl ${isWinner ? 'text-red-500' : 'text-blue-600'}`}>
                    {r.finalScore.toLocaleString()}원
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Score explanation */}
        <div className="bg-white border-4 border-black rounded-2xl p-4 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-black text-base mb-2 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> 점수 계산 방식</h3>
          <p className="font-bold text-sm text-slate-600">
            최종 자산 = 잔여 현금 + 부동산 카드 가치 합산 (카드 번호 × 1,000원)
          </p>
        </div>

        <button
          onClick={onBackToHome}
          className="w-full py-5 bg-blue-400 hover:bg-blue-300 text-black border-4 border-black rounded-xl font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-6 h-6" />
          로비로 돌아가기
        </button>
      </div>
    </div>
  );
}
