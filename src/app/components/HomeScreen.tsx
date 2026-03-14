import { useState } from 'react';
import { User, PlusCircle, KeyRound, Home, LogIn } from 'lucide-react';
import { playClick } from '../../lib/audio';

interface HomeScreenProps {
  onCreateRoom: (nickname: string) => void;
  onJoinRoom: (nickname: string, roomCode: string) => void;
}

export function HomeScreen({ onCreateRoom, onJoinRoom }: HomeScreenProps) {
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const handleCreate = () => {
    if (!nickname.trim()) { showError('닉네임을 먼저 입력해주세요!'); return; }
    playClick();
    onCreateRoom(nickname.trim());
  };

  const handleJoin = () => {
    if (!nickname.trim()) { showError('닉네임을 먼저 입력해주세요!'); return; }
    if (roomCode.trim().length < 4) { showError('올바른 방 코드를 입력해주세요!'); return; }
    playClick();
    onJoinRoom(nickname.trim(), roomCode.trim());
  };

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center font-sans overflow-y-auto"
      style={{
        backgroundColor: '#e0f2fe',
        backgroundImage: 'radial-gradient(#bae6fd 20%, transparent 20%), radial-gradient(#bae6fd 20%, transparent 20%)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
        padding: 'max(env(safe-area-inset-top), 0.5rem) max(env(safe-area-inset-right), 1rem) max(env(safe-area-inset-bottom), 0.5rem) max(env(safe-area-inset-left), 1rem)',
      }}
    >
      {error && (
        <div className="fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-md z-50 bg-red-400 border-2 sm:border-4 border-black text-black font-bold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce flex items-center justify-center gap-2 text-sm sm:text-base">
          ⚠️ {error}
        </div>
      )}

      <div className="w-full max-w-md flex-1 flex flex-col justify-center py-4 sm:py-6">
        {/* Title */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8 px-1">
          <div className="inline-block bg-yellow-400 border-2 sm:border-4 border-black px-3 py-0.5 sm:px-4 sm:py-1 rounded-xl sm:rounded-2xl mb-1.5 sm:mb-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2">
            <span className="text-sm sm:text-base md:text-lg font-black tracking-tight leading-tight">K-부동산 경매 보드게임</span>
          </div>
          <h1
            className="font-black text-white tracking-tighter leading-tight"
            style={{
              fontSize: 'clamp(2.25rem, 12vw, 3.75rem)',
              textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 6px 6px 0px rgba(0,0,0,1)',
            }}
          >
            JoopJoop
          </h1>
          <p className="text-base sm:text-lg font-bold text-slate-700 mt-0.5 sm:mt-1">영끌 로드</p>
        </div>

        {/* Card */}
        <div className="bg-white border-2 sm:border-4 border-black rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Nickname */}
          <div className="mb-4 sm:mb-6">
            <label className="flex items-center gap-2 text-base sm:text-lg font-black mb-1.5 sm:mb-2 text-blue-600">
              <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="사용할 닉네임을 입력하세요"
              maxLength={8}
              className="w-full text-base sm:text-lg p-2.5 sm:p-3 min-h-[44px] bg-slate-50 border-2 sm:border-4 border-black rounded-lg sm:rounded-xl focus:outline-none focus:bg-white font-bold transition-all"
            />
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Create room */}
            <button
              onClick={handleCreate}
              disabled={!nickname.trim()}
              className="w-full min-h-[48px] py-3 sm:py-4 bg-green-400 hover:bg-green-300 disabled:bg-slate-200 disabled:cursor-not-allowed text-black border-2 sm:border-4 border-black rounded-lg sm:rounded-xl font-black text-lg sm:text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 touch-manipulation"
            >
              <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              새 방 만들기
            </button>

            <div className="relative flex items-center py-0.5 sm:py-1">
              <div className="flex-grow border-t-2 sm:border-t-4 border-black border-dashed" />
              <span className="flex-shrink-0 mx-2 sm:mx-4 bg-black text-white px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-bold text-xs sm:text-sm">또는</span>
              <div className="flex-grow border-t-2 sm:border-t-4 border-black border-dashed" />
            </div>

            {/* Join room */}
            <div className="bg-slate-100 p-3 sm:p-4 border-2 sm:border-4 border-black rounded-lg sm:rounded-xl">
              <label className="flex items-center gap-2 text-sm sm:text-base font-black mb-1.5 sm:mb-2">
                <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 방 코드로 참가
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="6자리 코드"
                  maxLength={6}
                  className="flex-1 min-h-[44px] text-lg sm:text-xl p-2.5 sm:p-3 bg-white border-2 sm:border-4 border-black rounded-lg sm:rounded-xl focus:outline-none uppercase text-center font-black"
                />
                <button
                  onClick={handleJoin}
                  disabled={!nickname.trim() || roomCode.trim().length < 4}
                  className="min-h-[44px] px-4 sm:px-5 py-3 bg-blue-400 hover:bg-blue-300 disabled:bg-slate-200 disabled:cursor-not-allowed text-black border-2 sm:border-4 border-black rounded-lg sm:rounded-xl font-black text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1 touch-manipulation flex-shrink-0"
                >
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  입장
                </button>
              </div>
            </div>
          </div>

          {/* Room info */}
          <div className="mt-4 sm:mt-6 bg-yellow-50 border-2 sm:border-4 border-black border-dashed rounded-lg sm:rounded-xl p-3 sm:p-4">
            <p className="font-black text-xs sm:text-sm mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2"><Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" /> 게임 정보</p>
            <ul className="text-xs sm:text-sm font-bold text-slate-600 space-y-0.5 sm:space-y-1 list-disc list-inside leading-snug">
              <li>2~6명 참여 가능</li>
              <li>1단계: 직업 카드 경매 (시작 자금 15,000원)</li>
              <li>2단계: 부동산 카드 경매 (직업 카드 사용)</li>
              <li>게임 시작 전 특수 아이템 1개 선택!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
