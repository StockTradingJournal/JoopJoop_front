import { useState } from 'react';
import { User, PlusCircle, KeyRound, Home, LogIn } from 'lucide-react';

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
    onCreateRoom(nickname.trim());
  };

  const handleJoin = () => {
    if (!nickname.trim()) { showError('닉네임을 먼저 입력해주세요!'); return; }
    if (roomCode.trim().length < 4) { showError('올바른 방 코드를 입력해주세요!'); return; }
    onJoinRoom(nickname.trim(), roomCode.trim());
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 font-sans"
      style={{
        backgroundColor: '#e0f2fe',
        backgroundImage: 'radial-gradient(#bae6fd 20%, transparent 20%), radial-gradient(#bae6fd 20%, transparent 20%)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
      }}
    >
      {error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-400 border-4 border-black text-black font-bold px-5 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-block bg-yellow-400 border-4 border-black px-4 py-1 rounded-2xl mb-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2">
            <span className="text-lg font-black tracking-tight">K-부동산 경매 보드게임</span>
          </div>
          <h1
            className="text-6xl font-black text-white tracking-tighter"
            style={{ textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 6px 6px 0px rgba(0,0,0,1)' }}
          >
            FOR SALE
          </h1>
          <p className="text-lg font-bold text-slate-700 mt-1">영끌 로드</p>
        </div>

        {/* Card */}
        <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Nickname */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-lg font-black mb-2 text-blue-600">
              <User className="w-5 h-5" /> 닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="사용할 닉네임을 입력하세요"
              maxLength={8}
              className="w-full text-lg p-3 bg-slate-50 border-4 border-black rounded-xl focus:outline-none focus:bg-white font-bold transition-all"
            />
          </div>

          <div className="space-y-4">
            {/* Create room */}
            <button
              onClick={handleCreate}
              disabled={!nickname.trim()}
              className="w-full py-4 bg-green-400 hover:bg-green-300 disabled:bg-slate-200 disabled:cursor-not-allowed text-black border-4 border-black rounded-xl font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-6 h-6" />
              새 방 만들기
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t-4 border-black border-dashed" />
              <span className="flex-shrink-0 mx-4 bg-black text-white px-3 py-1 rounded-full font-bold text-sm">또는</span>
              <div className="flex-grow border-t-4 border-black border-dashed" />
            </div>

            {/* Join room */}
            <div className="bg-slate-100 p-4 border-4 border-black rounded-xl">
              <label className="flex items-center gap-2 text-base font-black mb-2">
                <KeyRound className="w-5 h-5" /> 방 코드로 참가
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="6자리 코드"
                  maxLength={6}
                  className="flex-1 text-xl p-3 bg-white border-4 border-black rounded-xl focus:outline-none uppercase text-center font-black"
                />
                <button
                  onClick={handleJoin}
                  disabled={!nickname.trim() || roomCode.trim().length < 4}
                  className="px-5 bg-blue-400 hover:bg-blue-300 disabled:bg-slate-200 disabled:cursor-not-allowed text-black border-4 border-black rounded-xl font-black text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1"
                >
                  <LogIn className="w-5 h-5" />
                  입장
                </button>
              </div>
            </div>
          </div>

          {/* Room info */}
          <div className="mt-6 bg-yellow-50 border-4 border-black border-dashed rounded-xl p-4">
            <p className="font-black text-sm mb-2 flex items-center gap-2"><Home className="w-4 h-4" /> 게임 정보</p>
            <ul className="text-sm font-bold text-slate-600 space-y-1 list-disc list-inside">
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
