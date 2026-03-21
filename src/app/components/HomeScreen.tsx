import { useState } from 'react';
import { User, ArrowRight, AlertCircle } from 'lucide-react';
import { playClick } from '../../lib/audio';

interface HomeScreenProps {
  onEnterLobby: (nickname: string) => void;
}

export function HomeScreen({ onEnterLobby }: HomeScreenProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const handleEnter = () => {
    if (!nickname.trim()) {
      showError('닉네임을 먼저 입력해주세요!');
      return;
    }
    playClick();
    onEnterLobby(nickname.trim());
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
        <div className="fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-md z-[60] bg-red-400 border-2 sm:border-4 border-black text-black font-bold px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce flex items-center justify-center gap-2 text-sm sm:text-base">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="w-full max-w-md flex-1 flex flex-col justify-center py-4 sm:py-6">
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

        <div className="bg-white border-2 sm:border-4 border-black rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className="mb-6 sm:mb-8 text-left">
            <label className="flex items-center gap-2 text-base sm:text-lg font-black mb-1.5 sm:mb-2 text-blue-600">
              <User className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 입주자 등록
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === 'Enter') handleEnter();
              }}
              placeholder="사용할 닉네임을 입력하세요"
              maxLength={8}
              className="w-full text-base sm:text-lg p-2.5 sm:p-3 min-h-[44px] bg-slate-50 border-2 sm:border-4 border-black rounded-lg sm:rounded-xl focus:outline-none focus:bg-white font-bold transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleEnter}
            className="w-full min-h-[48px] py-3 sm:py-4 bg-blue-500 hover:bg-blue-400 text-white border-2 sm:border-4 border-black rounded-lg sm:rounded-xl font-black text-lg sm:text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 touch-manipulation"
          >
            입장하기 <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
