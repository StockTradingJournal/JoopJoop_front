import React, { useState, useEffect, useRef } from 'react';
import { User, Home, KeyRound, ArrowRight, PlusCircle, Users, Copy, CheckCircle2, AlertCircle, Crown, Check, LogOut, Play, X, Clock, Coins, ScrollText, Timer, Trophy, Medal, RefreshCw, Eye, ArrowLeftRight, HelpCircle } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('lobby'); // 'lobby' | 'waiting' | 'itemSelection' | 'phase1' | 'phase2' | 'result'
  const [nickname, setNickname] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState('');
  const [error, setError] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [gameData, setGameData] = useState(null); // 페이즈 간 플레이어 데이터 전달용

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const handleCreateRoom = () => {
    if (!nickname.trim()) { showError('입주자(닉네임) 이름을 먼저 적어주세요!'); return; }
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCurrentRoom(newCode); setIsHost(true); setView('waiting');
  };

  const handleJoinRoom = () => {
    if (!nickname.trim()) { showError('입주자(닉네임) 이름을 먼저 적어주세요!'); return; }
    if (!roomCode.trim() || roomCode.length < 6) { showError('정확한 6자리 방 코드를 입력해주세요!'); return; }
    setCurrentRoom(roomCode.toUpperCase()); setIsHost(false); setView('waiting');
  };

  const getBackgroundStyle = () => {
    if (view === 'itemSelection') return { bg: '#f3e8ff', grad: '#e9d5ff' }; // 연보라 (아이템 선택)
    if (view === 'phase1') return { bg: '#fef08a', grad: '#fde047' }; // 노란색 (직업 경매)
    if (view === 'phase2') return { bg: '#e0e7ff', grad: '#c7d2fe' }; // 파란색 (부동산 경매)
    if (view === 'result') return { bg: '#ffedd5', grad: '#fed7aa' }; // 주황색 (결과)
    return { bg: '#e0f2fe', grad: '#bae6fd' }; // 기본 파란색 (로비)
  };
  const bgTheme = getBackgroundStyle();

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 font-sans text-slate-900 selection:bg-yellow-300 transition-colors duration-1000"
      style={{ backgroundColor: bgTheme.bg, backgroundImage: `radial-gradient(${bgTheme.grad} 20%, transparent 20%), radial-gradient(${bgTheme.grad} 20%, transparent 20%)`, backgroundSize: '24px 24px', backgroundPosition: '0 0, 12px 12px' }}
    >
      <div className="w-full max-w-5xl relative flex justify-center">
        {error && (
          <div className="fixed top-10 bg-red-400 border-4 border-black text-black font-bold p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 z-50 animate-bounce">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {view === 'lobby' && (
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8 transform -rotate-2">
              <div className="inline-block bg-yellow-400 border-4 border-black px-4 py-1 rounded-2xl mb-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-xl font-black tracking-tight">K-부동산 경매 보드게임</h2>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter" style={{ textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 6px 6px 0px rgba(0,0,0,1)' }}>
                영끌 로드
              </h1>
            </div>

            <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-8">
                <label className="flex items-center gap-2 text-xl font-black mb-3 text-blue-600"><User className="w-6 h-6" /> 입주자 등록</label>
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="사용할 닉네임을 입력하세요" className="w-full text-lg p-4 bg-slate-50 border-4 border-black rounded-xl focus:outline-none focus:bg-white focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold" maxLength={8} />
              </div>

              <div className="space-y-6 pt-6 border-t-4 border-black border-dashed">
                <button onClick={handleCreateRoom} className="w-full py-4 bg-green-400 hover:bg-green-300 text-black border-4 border-black rounded-xl font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"><PlusCircle className="w-6 h-6" /> 새 부동산 방 만들기</button>
                <div className="relative flex items-center py-2"><div className="flex-grow border-t-4 border-black border-dashed"></div><span className="flex-shrink-0 mx-4 bg-black text-white px-3 py-1 rounded-full font-bold text-sm">또는</span><div className="flex-grow border-t-4 border-black border-dashed"></div></div>
                <div className="bg-slate-100 p-4 border-4 border-black rounded-xl">
                  <label className="flex items-center gap-2 text-lg font-black mb-2"><KeyRound className="w-5 h-5" /> 방 코드로 입장</label>
                  <div className="flex gap-2">
                    <input type="text" value={roomCode} onChange={(e) => setRoomCode(e.target.value.toUpperCase())} placeholder="6자리 코드" maxLength={6} className="w-2/3 text-xl p-3 bg-white border-4 border-black rounded-xl focus:outline-none uppercase text-center font-black" />
                    <button onClick={handleJoinRoom} className="w-1/3 bg-blue-400 hover:bg-blue-300 text-black border-4 border-black rounded-xl font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">입장</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'waiting' && <WaitingRoom nickname={nickname} roomCode={currentRoom} isHost={isHost} onLeave={() => { setView('lobby'); setRoomCode(''); }} onStart={(players) => { setGameData(players); setView('itemSelection'); }} />}
        {view === 'itemSelection' && <ItemSelectionScreen players={gameData} onComplete={(playersWithItems) => { setGameData(playersWithItems); setView('phase1'); }} />}
        {view === 'phase1' && <GamePhase1 initialPlayers={gameData} onComplete={(data) => { setGameData(data); setView('phase2'); }} />}
        {view === 'phase2' && <GamePhase2 initialPlayers={gameData} onComplete={(data) => { setGameData(data); setView('result'); }} />}
        {view === 'result' && <ResultScreen players={gameData} onReplay={() => { setView('lobby'); setRoomCode(''); setGameData(null); }} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 아이템 데이터 및 공용 렌더러
// ----------------------------------------------------------------------
const ITEMS = {
  reroll: { id: 'reroll', name: '리롤', desc: '현재 라운드의 카드를 다시 섞어 새로 배치합니다.', icon: RefreshCw, color: 'bg-blue-400' },
  peek: { id: 'peek', name: '엿보기', desc: '상대 1명의 자산(돈 또는 부동산)을 몰래 확인합니다.', icon: Eye, color: 'bg-purple-400' },
  reverse: { id: 'reverse', name: '리버스', desc: '이번 라운드의 턴 순서를 반대로 바꿉니다. (사용 시 포기 불가)', icon: ArrowLeftRight, color: 'bg-orange-400' }
};

const PlayerItemBadge = ({ item }) => {
  if (!item) return null;
  const itemData = ITEMS[item.type];
  const Icon = itemData.icon;
  return (
    <div className={`absolute -bottom-2 -left-2 w-8 h-8 rounded-full border-2 border-black flex items-center justify-center z-10 ${item.used ? 'bg-slate-300 grayscale opacity-70' : itemData.color}`} title={`${itemData.name} ${item.used ? '(사용됨)' : ''}`}>
      <Icon className="w-4 h-4 text-black font-bold" />
      {item.used && <div className="absolute inset-0 flex items-center justify-center"><X className="w-6 h-6 text-red-600" /></div>}
    </div>
  );
};

// ----------------------------------------------------------------------
// 직업 카드 / 부동산 카드 데이터 및 컴포넌트
// ----------------------------------------------------------------------
const JOB_DATA = { 1: { title: "폐지 줍기", color: "bg-[#e2dac9]", emoji: "📦" }, 2: { title: "신문/전단지 배달원", color: "bg-[#b7d6e6]", emoji: "🚲" }, 3: { title: "편의점 야간 알바생", color: "bg-[#6a90c9]", emoji: "🏪" }, 4: { title: "무명 예술가", color: "bg-[#d4b48e]", emoji: "🎨" }, 5: { title: "사회초년생 인턴", color: "bg-[#b9c2db]", emoji: "👔" }, 6: { title: "배달 라이더", color: "bg-[#f5dd76]", emoji: "🛵" }, 7: { title: "계약직 사무 보조", color: "bg-[#d1d5db]", emoji: "🖨️" }, 8: { title: "영세 프리랜서 작가", color: "bg-[#e8dcc5]", emoji: "💻" }, 9: { title: "콜센터 상담원", color: "bg-[#fbcfe8]", emoji: "🎧" }, 10: { title: "중소기업 신입 사원", color: "bg-[#f3f4f6]", emoji: "🏢" }, 11: { title: "초/중등 교사", color: "bg-[#bce3c4]", emoji: "🏫" }, 12: { title: "은행 창구 직원", color: "bg-[#bae6fd]", emoji: "🏦" }, 13: { title: "7급 공무원", color: "bg-[#fcd34d]", emoji: "📝" }, 14: { title: "중견기업 대리", color: "bg-[#f8fafc]", emoji: "💼" }, 15: { title: "종합병원 간호사", color: "bg-[#99f6e4]", emoji: "💉" }, 16: { title: "대기업 생산직", color: "bg-[#bfdbfe]", emoji: "🏭" }, 17: { title: "판교 IT 개발자", color: "bg-[#cbd5e1]", emoji: "⌨️" }, 18: { title: "대기업 과장", color: "bg-[#93c5fd]", emoji: "📊" }, 19: { title: "약사", color: "bg-[#ecfdf5]", emoji: "💊" }, 20: { title: "5급 행정고시 합격", color: "bg-[#fef08a]", emoji: "📜" }, 21: { title: "대형 로펌 변호사", color: "bg-[#d6d3d1]", emoji: "⚖️" }, 22: { title: "대학병원 전문의", color: "bg-[#5eead4]", emoji: "🩺" }, 23: { title: "대기업 임원", color: "bg-[#fcd34d]", emoji: "📈" }, 24: { title: "100만 유튜버", color: "bg-[#fee2e2]", emoji: "🎥" }, 25: { title: "강남 성형외과 원장", color: "bg-[#ffe4e6]", emoji: "🏥" }, 26: { title: "유니콘 스타트업 CEO", color: "bg-[#e0e7ff]", emoji: "🦄" }, 27: { title: "비트코인 초대박난 개미", color: "bg-[#86efac]", emoji: "🚀" }, 28: { title: "톱스타 연예인", color: "bg-[#e879f9]", emoji: "⭐" }, 29: { title: "재벌 3세", color: "bg-[#52525b]", emoji: "👑" }, 30: { title: "조물주 위 건물주", color: "bg-[#7dd3fc]", emoji: "🏙️" } };
const REAL_ESTATE_DATA = { 1: { title: "바선생 반지하", color: "bg-[#8c8273]", emoji: "🪳" }, 2: { title: "달동네 판자집", color: "bg-[#6b7280]", emoji: "🏚️" }, 3: { title: "초가집", color: "bg-[#d97706]", emoji: "🛖" }, 4: { title: "24시 찜질방", color: "bg-[#fca5a5]", emoji: "♨️" }, 5: { title: "고시원", color: "bg-[#d1d5db]", emoji: "🛏️" }, 6: { title: "해방촌 옥탑방", color: "bg-[#93c5fd]", emoji: "🌃" }, 7: { title: "노엘베 빌라", color: "bg-[#d6d3d1]", emoji: "🧱" }, 8: { title: "단독주택", color: "bg-[#86efac]", emoji: "🏡" }, 9: { title: "주상복합 오피스텔", color: "bg-[#cbd5e1]", emoji: "🏢" }, 10: { title: "구축 아파트", color: "bg-[#9ca3af]", emoji: "🏢" }, 11: { title: "역세권 아파트", color: "bg-[#3b82f6]", emoji: "🚉" }, 12: { title: "동탄 신도시 아파트", color: "bg-[#a78bfa]", emoji: "🏙️" }, 13: { title: "반포 자이", color: "bg-[#fde047]", emoji: "⛲" }, 14: { title: "현대 아이파크", color: "bg-[#c084fc]", emoji: "💎" }, 15: { title: "한남 더 힐", color: "bg-[#f43f5e]", emoji: "🏰" } };

const JobCard = ({ cardId, isMini = false, showPassBadge = false, isHidden = false, isSelected = false, onClick }) => {
  const data = JOB_DATA[cardId] || { title: "알 수 없음", color: "bg-white", emoji: "❓" };
  if (isHidden) return (<div className={`w-20 h-32 md:w-28 md:h-40 bg-slate-800 border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative ${isSelected ? '-translate-y-4 ring-4 ring-yellow-400' : ''}`}><span className="text-white font-black text-center text-sm px-2 border-2 border-white rounded-lg p-1 opacity-50">비밀<br/>카드</span></div>);
  if (isMini) return (<div onClick={onClick} className={`flex-none w-14 h-20 border-2 border-black rounded-lg flex flex-col overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${data.color} relative cursor-pointer transition-transform ${isSelected ? '-translate-y-3 ring-2 ring-blue-600' : 'hover:-translate-y-1'}`}><div className="absolute top-0.5 left-1 text-[8px] font-black opacity-60">{cardId}</div><div className="flex-1 flex items-center justify-center text-xl drop-shadow-sm">{data.emoji}</div><div className="bg-white border-t-2 border-black text-[8px] font-black text-center truncate px-0.5 py-0.5 leading-none">{data.title}</div></div>);
  return (<div className={`w-28 h-40 md:w-36 md:h-52 border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col relative transform transition-transform hover:-translate-y-4 ${data.color} ${isSelected ? 'ring-4 ring-yellow-400' : ''}`}><div className="flex-1 flex items-center justify-center text-5xl md:text-6xl drop-shadow-md">{data.emoji}</div><div className="bg-white border-t-4 border-black py-1.5 px-1 flex items-center gap-1 justify-center z-10 relative h-10 md:h-12 rounded-b-lg"><span className="font-black text-sm md:text-base">{cardId}.</span><span className="font-bold text-[10px] md:text-xs text-center leading-tight tracking-tight break-keep">{data.title}</span></div>{showPassBadge && <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-400 text-white font-black text-xs px-3 py-1 rounded-full border-2 border-black whitespace-nowrap z-20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-bounce">포기시 획득</span>}</div>)
};

const RealEstateCard = ({ cardId, isMini = false }) => {
  const data = REAL_ESTATE_DATA[cardId] || { title: "알 수 없음", color: "bg-white", emoji: "❓" };
  if (isMini) return (<div className={`flex-none w-16 h-20 border-2 border-black rounded-lg flex flex-col overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${data.color} relative`}><div className="absolute top-0.5 right-1 text-[8px] font-black text-white drop-shadow-md">{cardId}</div><div className="flex-1 flex items-center justify-center text-xl drop-shadow-sm">{data.emoji}</div><div className="bg-white border-t-2 border-black text-[8px] font-black text-center truncate px-0.5 py-0.5 leading-none">{data.title}</div></div>);
  return (<div className={`w-28 h-40 md:w-36 md:h-52 border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col relative transform transition-transform hover:-translate-y-4 ${data.color}`}><div className="absolute top-2 right-2 bg-black text-white font-black text-xs px-2 py-0.5 rounded-full z-10">NO.{cardId}</div><div className="flex-1 flex items-center justify-center text-5xl md:text-6xl drop-shadow-md">{data.emoji}</div><div className="bg-white border-t-4 border-black py-1.5 px-1 flex flex-col items-center justify-center z-10 relative h-12 md:h-14 rounded-b-lg"><span className="font-black text-[10px] md:text-xs text-center leading-tight tracking-tight break-keep">{data.title}</span><span className="font-black text-blue-600 text-xs md:text-sm mt-0.5">{(cardId * 1000).toLocaleString()}원</span></div></div>)
};

// ----------------------------------------------------------------------
// 대기방 & 아이템 선택 화면
// ----------------------------------------------------------------------
const WaitingRoom = ({ nickname, roomCode, isHost, onLeave, onStart }) => {
  const [players, setPlayers] = useState([{ id: 'me', nickname, isHost, isReady: isHost, isMe: true, color: 'bg-yellow-300' }]);
  useEffect(() => {
    const t1 = setTimeout(() => setPlayers(prev => [...prev, { id: 'bot1', nickname: '무주택자', isHost: !isHost, isReady: !isHost, isMe: false, color: 'bg-pink-300' }]), 1000);
    const t2 = setTimeout(() => setPlayers(prev => [...prev, { id: 'bot2', nickname: '청약대기', isHost: false, isReady: false, isMe: false, color: 'bg-cyan-300' }]), 2500);
    const t3 = setTimeout(() => setPlayers(prev => prev.map(p => (!p.isMe ? { ...p, isReady: true } : p))), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isHost]);

  useEffect(() => {
    if (!isHost && players.length >= 3 && players.every(p => p.isReady)) {
      const t = setTimeout(() => onStart(players), 1500);
      return () => clearTimeout(t);
    }
  }, [players, isHost, onStart]);

  const canStart = isHost && players.length >= 3 && players.every(p => p.isReady);

  return (
    <div className="w-full max-w-3xl bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6 animate-in fade-in zoom-in">
      <div className="flex justify-between items-center bg-blue-50 border-4 border-black rounded-2xl p-4">
        <div><span className="text-blue-600 font-bold">대기방</span><h2 className="text-2xl font-black">모두가 준비하면 시작!</h2></div>
        <div className="bg-white border-4 border-black rounded-xl p-2 px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><span className="text-3xl font-black tracking-widest text-blue-600">{roomCode}</span></div>
      </div>
      <div className="border-4 border-black rounded-2xl p-6 bg-slate-50 relative">
        <h3 className="font-black text-xl mb-4 border-b-4 border-black pb-2 flex items-center gap-2"><Users className="w-6 h-6"/> 입주자들</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {players.map((p) => (
            <div key={p.id} className={`flex flex-col items-center gap-2 p-4 border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${p.isReady ? 'bg-green-50' : 'bg-white'}`}>
              <div className={`w-16 h-16 rounded-full border-4 border-black ${p.color} flex items-center justify-center`}><User className="w-8 h-8" /></div>
              <span className="font-black text-lg">{p.nickname}</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.isReady ? 'bg-green-200 text-green-700' : 'bg-slate-200'}`}>{p.isReady ? '준비 완료' : '대기 중'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-4 mt-2">
        <button onClick={onLeave} className="px-6 py-4 bg-slate-200 text-black border-4 border-black rounded-xl font-black text-lg">나가기</button>
        {isHost ? (
          <button onClick={() => onStart(players)} disabled={!canStart} className={`flex-1 py-4 border-4 border-black rounded-xl font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${canStart ? 'bg-green-400' : 'bg-slate-300'}`}>아이템 선택으로 이동!</button>
        ) : (
          <button onClick={() => setPlayers(prev => prev.map(p => p.isMe ? { ...p, isReady: !p.isReady } : p))} className={`flex-1 py-4 border-4 border-black rounded-xl font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${players.find(p=>p.isMe)?.isReady ? 'bg-red-400 text-white' : 'bg-green-400 text-black'}`}>{players.find(p=>p.isMe)?.isReady ? '준비 취소' : '준비 완료'}</button>
        )}
      </div>
    </div>
  );
};

const ItemSelectionScreen = ({ players, onComplete }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [allReady, setAllReady] = useState(false);

  useEffect(() => {
    if (selectedItem) {
      // 봇들의 랜덤 아이템 선택 (1~2초 후)
      const timer = setTimeout(() => {
        const itemKeys = Object.keys(ITEMS);
        const finalPlayers = players.map(p => {
          if (p.isMe) return { ...p, item: { type: selectedItem, used: false } };
          const randomItem = itemKeys[Math.floor(Math.random() * itemKeys.length)];
          return { ...p, item: { type: randomItem, used: false } };
        });
        setAllReady(true);
        setTimeout(() => onComplete(finalPlayers), 2000); // 모두 준비되면 2초 후 1단계로 자동 이동
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [selectedItem, players, onComplete]);

  return (
    <div className="w-full max-w-4xl bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center animate-in zoom-in">
      <h2 className="text-4xl font-black mb-2 text-purple-600">아이템 획득 시간!</h2>
      <p className="text-lg font-bold text-slate-600 mb-8">게임 전체에서 딱 1번 사용할 수 있는 특수 아이템을 1개 골라주세요.</p>

      {allReady ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
          <h3 className="text-3xl font-black">선택 완료! 1단계 경매로 이동합니다...</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {Object.entries(ITEMS).map(([key, item]) => {
            const Icon = item.icon;
            const isSelected = selectedItem === key;
            return (
              <div 
                key={key} 
                onClick={() => !selectedItem && setSelectedItem(key)}
                className={`relative flex flex-col items-center p-6 border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform ${selectedItem ? (isSelected ? 'bg-yellow-100 ring-4 ring-yellow-400 scale-105' : 'bg-slate-100 opacity-50') : `bg-white cursor-pointer hover:-translate-y-2 hover:${item.color}`}`}
              >
                <div className={`w-20 h-20 rounded-full border-4 border-black flex items-center justify-center mb-4 ${item.color}`}><Icon className="w-10 h-10 text-white" /></div>
                <h3 className="text-2xl font-black mb-2">{item.name}</h3>
                <p className="text-sm font-bold text-slate-600 text-center break-keep leading-snug">{item.desc}</p>
                {isSelected && <div className="absolute -top-3 -right-3 bg-red-500 text-white font-black px-3 py-1 border-2 border-black rounded-full rotate-12">선택완료!</div>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// 1단계: 직업 경매 화면
// ----------------------------------------------------------------------
const GamePhase1 = ({ initialPlayers, onComplete }) => {
  const [players, setPlayers] = useState(initialPlayers.map(p => ({ ...p, money: 15000, currentBid: 0, hasPassed: false, cards: [], realEstates: [], avatar: p.color })));
  const [deck, setDeck] = useState([]);
  const [revealedCards, setRevealedCards] = useState([]);
  const [round, setRound] = useState(1);
  const [turnIndex, setTurnIndex] = useState(0); 
  const [turnDirection, setTurnDirection] = useState(1); // 1: 정방향, -1: 역방향
  const [highestBid, setHighestBid] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [phase, setPhase] = useState('bidding');
  const [bidInput, setBidInput] = useState(1000);
  
  // 리버스 관련 상태
  const [roundReverseUsed, setRoundReverseUsed] = useState(false);
  const [mustBid, setMustBid] = useState(false);

  // 엿보기 모달 상태
  const [peekState, setPeekState] = useState({ active: false, targetId: null, targetValue: null });

  const stateRef = useRef({ players, revealedCards, turnIndex, highestBid, turnDirection, roundReverseUsed, mustBid, phase });
  useEffect(() => { stateRef.current = { players, revealedCards, turnIndex, highestBid, turnDirection, roundReverseUsed, mustBid, phase }; }, [players, revealedCards, turnIndex, highestBid, turnDirection, roundReverseUsed, mustBid, phase]);

  useEffect(() => {
    const newDeck = Array.from({length: 30}, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    const numPlayers = players.length;
    setDeck(newDeck.slice(numPlayers));
    setRevealedCards(newDeck.slice(0, numPlayers).sort((a, b) => a - b));
  }, []);

  useEffect(() => {
    if (phase !== 'bidding') return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { 
          // 만약 mustBid 상태에서 시간이 다 되면 강제 베팅 또는 파산 처리
          if (stateRef.current.mustBid) {
            const p = stateRef.current.players[stateRef.current.turnIndex];
            const nextBid = stateRef.current.highestBid + 1000;
            if (p.money + p.currentBid >= nextBid) handleBid(stateRef.current.turnIndex, nextBid);
            else handlePass(stateRef.current.turnIndex, true); // 돈없으면 예외적 포기
          } else {
            handlePass(stateRef.current.turnIndex); 
          }
          return 10; 
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, turnIndex]);

  useEffect(() => {
    if (phase !== 'bidding') return;
    const { players: currentPlayers, highestBid: currentHighest } = stateRef.current;
    const currentPlayer = currentPlayers[turnIndex];
    if (currentPlayer.isMe || currentPlayer.hasPassed) return;

    const t = setTimeout(() => {
      if (stateRef.current.phase !== 'bidding') return;
      const maxBid = currentPlayer.money + currentPlayer.currentBid;
      const nextBid = currentHighest + 1000;
      if (maxBid < nextBid) handlePass(turnIndex);
      else { Math.random() < 0.7 ? handleBid(turnIndex, nextBid) : handlePass(turnIndex); }
    }, 1500 + Math.random() * 1000);
    return () => clearTimeout(t);
  }, [phase, turnIndex]);

  useEffect(() => {
    if (phase === 'roundEnd') {
      const t = setTimeout(() => startNextRound(), 3000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const startNextRound = () => {
    const numPlayers = stateRef.current.players.length;
    if (deck.length < numPlayers) { setPhase('phase1End'); return; }
    setRevealedCards([...deck].splice(0, numPlayers).sort((a, b) => a - b));
    setDeck(deck.slice(numPlayers));
    setRound(r => r + 1);
    setHighestBid(0); setBidInput(1000); setTurnIndex(0); setTimeLeft(10);
    setTurnDirection(1); setRoundReverseUsed(false); setMustBid(false); // 라운드 초기화
    setPlayers(prev => prev.map(p => ({ ...p, hasPassed: false, currentBid: 0 })));
    setPhase('bidding');
  };

  const getNextTurn = (currentIndex, dir, currentPlayers) => {
    let nextIdx = (currentIndex + dir + currentPlayers.length) % currentPlayers.length;
    while(currentPlayers[nextIdx].hasPassed) {
      nextIdx = (nextIdx + dir + currentPlayers.length) % currentPlayers.length;
    }
    return nextIdx;
  };

  const handleBid = (pIndex, amount) => {
    const { players: curPlayers, turnDirection: dir } = stateRef.current;
    const p = curPlayers[pIndex];
    let newPlayers = [...curPlayers];
    newPlayers[pIndex] = { ...p, money: p.money - (amount - p.currentBid), currentBid: amount };
    
    setPlayers(newPlayers); setHighestBid(amount); setTimeLeft(10);
    if (newPlayers[pIndex].isMe) setMustBid(false); // 내가 베팅했으므로 강제베팅 해제
    
    const nextIdx = getNextTurn(pIndex, dir, newPlayers);
    setTurnIndex(nextIdx);
    if (newPlayers[nextIdx].isMe) setBidInput(amount + 1000);
  };

  const handlePass = (pIndex, force = false) => {
    const { players: curPlayers, revealedCards: curRevealed, mustBid: currentMustBid, turnDirection: dir } = stateRef.current;
    const p = curPlayers[pIndex];
    if (p.hasPassed) return;
    
    // 리버스를 방금 써서 무조건 베팅해야 하는데 포기하려고 하면 막음 (단, 돈이 부족한 force 예외는 허용)
    if (currentMustBid && p.isMe && !force) return;

    const refund = Math.floor((p.currentBid / 2) / 1000) * 1000;
    let newPlayers = [...curPlayers];
    newPlayers[pIndex] = { ...p, hasPassed: true, money: p.money + refund, cards: [...p.cards, curRevealed[0]], currentBid: 0 };

    const activePlayers = newPlayers.filter(pl => !pl.hasPassed);
    if (activePlayers.length === 1) {
      const lastIndex = newPlayers.findIndex(pl => pl.id === activePlayers[0].id);
      newPlayers[lastIndex] = { ...newPlayers[lastIndex], hasPassed: true, cards: [...newPlayers[lastIndex].cards, curRevealed[1]], currentBid: 0 };
      setPlayers(newPlayers); setRevealedCards([]); setPhase('roundEnd');
    } else {
      setPlayers(newPlayers); setRevealedCards(curRevealed.slice(1));
      const nextIdx = getNextTurn(pIndex, dir, newPlayers);
      setTurnIndex(nextIdx); setTimeLeft(10);
      if (p.isMe) setMustBid(false);
    }
  };

  // ------------------------------------------------------------------
  // 아이템 사용 로직 (1단계)
  // ------------------------------------------------------------------
  const handleUseItem = (type) => {
    const me = players.find(p => p.isMe);
    if (me.item?.type !== type || me.item.used) return;

    if (type === 'reroll') {
      // 리롤: 첫번째 턴인 사람만 가능 (모든 사람의 베팅금이 0일 때)
      if (highestBid > 0 || players.some(p => p.hasPassed)) {
        showError('리롤 아이템은 라운드 첫 번째 턴에만 사용할 수 있습니다!'); return;
      }
      const numPlayers = players.length;
      const newRevealed = deck.slice(0, numPlayers).sort((a,b)=>a-b);
      const newDeck = [...deck.slice(numPlayers), ...revealedCards].sort(() => Math.random() - 0.5);
      setRevealedCards(newRevealed);
      setDeck(newDeck);
      setPlayers(prev => prev.map(p => p.isMe ? { ...p, item: { ...p.item, used: true } } : p));
    } 
    else if (type === 'peek') {
      setPeekState({ active: true, targetId: null, targetValue: null });
    }
    else if (type === 'reverse') {
      if (roundReverseUsed) { showError('이번 라운드에 이미 누군가 리버스를 사용했습니다!'); return; }
      setTurnDirection(dir => -dir);
      setRoundReverseUsed(true);
      setMustBid(true); // 포기 불가 상태 돌입
      setPlayers(prev => prev.map(p => p.isMe ? { ...p, item: { ...p.item, used: true } } : p));
    }
  };

  const executePeek = (targetPlayer) => {
    setPeekState({ active: true, targetId: targetPlayer.id, targetValue: targetPlayer.money });
    setPlayers(prev => prev.map(p => p.isMe ? { ...p, item: { ...p.item, used: true } } : p));
    setTimeout(() => setPeekState({ active: false, targetId: null, targetValue: null }), 3000); // 3초 뒤 모달 닫힘
  };

  const me = players.find(p => p.isMe);
  const isMyTurn = turnIndex === players.findIndex(p => p.isMe) && phase === 'bidding';
  const canBid = me.money + me.currentBid >= bidInput && bidInput > highestBid;
  const isFirstTurn = highestBid === 0 && !players.some(p => p.hasPassed);

  return (
    <div className="w-full max-w-4xl bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[85vh] animate-in slide-in-from-bottom-8 relative">
      
      {/* 엿보기 모달 */}
      {peekState.active && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center animate-in zoom-in">
            <Eye className="w-16 h-16 text-purple-600 mb-4" />
            {!peekState.targetId ? (
              <>
                <h3 className="text-2xl font-black mb-4">누구의 자산을 엿볼까요?</h3>
                <div className="flex gap-4 w-full">
                  {players.filter(p => !p.isMe).map(p => (
                    <button key={p.id} onClick={() => executePeek(p)} className="flex-1 p-4 border-4 border-black rounded-xl hover:bg-slate-100 font-black text-lg flex flex-col items-center gap-2 transition-transform hover:-translate-y-1">
                       <div className={`w-12 h-12 rounded-full border-4 border-black ${p.avatar} flex items-center justify-center`}><User className="w-6 h-6 text-black" /></div>
                       {p.nickname}
                    </button>
                  ))}
                </div>
                <button onClick={() => setPeekState({ active: false, targetId: null, targetValue: null })} className="mt-4 px-6 py-2 bg-slate-200 border-4 border-black rounded-full font-bold">취소</button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-black mb-2 text-blue-600">비밀 정보 획득!</h3>
                <p className="font-bold text-slate-600 mb-4">해당 유저의 남은 돈을 확인했습니다.</p>
                <div className="bg-slate-100 border-4 border-black border-dashed rounded-xl p-4 text-center w-full">
                  <span className="block text-sm font-bold text-slate-500 mb-1">상대방 자산 잔액</span>
                  <span className="text-4xl font-black text-yellow-600">{peekState.targetValue.toLocaleString()}원</span>
                </div>
                <p className="mt-4 text-sm font-bold text-slate-400 animate-pulse">3초 후 자동으로 닫힙니다...</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* 상대방 영역 */}
      <div className="bg-slate-100 p-4 border-b-4 border-black flex justify-center gap-6 relative">
        <div className="absolute top-4 left-4 font-black text-xl flex flex-col">
          <span className="bg-black text-white px-3 py-1 rounded-full text-sm self-start mb-1">Phase 1. 직업 경매</span>
          라운드 {round} {turnDirection === -1 && <span className="text-xs bg-orange-500 text-white px-2 rounded-full mt-1 animate-pulse">순서 역방향 진행중!</span>}
        </div>
        {players.filter(p => !p.isMe).map(p => {
          const isThisTurn = turnIndex === players.findIndex(x => x.id === p.id) && phase === 'bidding';
          return (
            <div key={p.id} className={`relative flex flex-col items-center p-3 border-4 border-black rounded-xl w-28 md:w-32 ${p.hasPassed ? 'bg-slate-300 opacity-60' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'} ${isThisTurn ? 'ring-4 ring-yellow-400 -translate-y-2' : ''}`}>
              {isThisTurn && <span className="absolute -top-4 bg-yellow-400 border-2 border-black rounded-full px-3 py-0.5 text-xs font-black animate-bounce z-10">고민중..</span>}
              <div className={`w-12 h-12 rounded-full border-4 border-black ${p.avatar} flex items-center justify-center mb-2 relative`}>
                <User className="w-6 h-6 text-black" />
                <PlayerItemBadge item={p.item} />
              </div>
              <span className="font-bold text-sm truncate w-full text-center">{p.nickname}</span>
              {p.hasPassed ? <span className="text-sm font-black text-red-600 bg-red-100 px-2 py-0.5 mt-1 rounded border-2 border-red-300">포기</span> : <span className="text-sm font-black text-blue-600 bg-blue-100 px-2 py-0.5 mt-1 rounded border-2 border-blue-300">{p.currentBid.toLocaleString()}원</span>}
            </div>
          );
        })}
      </div>

      {/* 중앙 보드 */}
      <div className="flex-1 bg-green-50 p-6 flex flex-col items-center justify-center relative">
        {phase === 'phase1End' ? (
          <div className="text-center animate-in zoom-in duration-500">
            <h2 className="text-4xl font-black mb-4">1단계 경매가 종료되었습니다!</h2>
            <button onClick={() => onComplete(players)} className="px-8 py-4 bg-blue-400 hover:bg-blue-300 text-black border-4 border-black rounded-xl font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 mx-auto">
              2단계 부동산 경매로 이동 <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <>
            {phase === 'bidding' && (
              <div className="absolute top-6 flex items-center gap-2 bg-white border-4 border-black px-4 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Timer className="w-6 h-6 text-red-500 animate-pulse" />
                <span className="font-black text-xl text-red-500">{timeLeft}초 남음</span>
              </div>
            )}
            <div className="flex items-end justify-center gap-4 md:gap-8 mt-12">
              <div className="w-28 h-40 md:w-36 md:h-52 bg-slate-800 border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-[-5deg] relative">
                <span className="text-white font-black text-center text-sm px-2 border-2 border-white rounded-lg p-1">직업<br/>카드<br/>더미</span>
              </div>
              <div className="flex gap-2 md:gap-4">
                {revealedCards.map((card, idx) => <JobCard key={idx} cardId={card} showPassBadge={idx === 0} />)}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 하단 내 컨트롤 */}
      <div className={`p-4 md:p-6 border-t-4 border-black flex flex-col gap-4 transition-colors ${isMyTurn ? 'bg-yellow-100' : 'bg-slate-50'}`}>
        
        {/* 아이템 패널 */}
        <div className="flex justify-between items-center border-b-2 border-dashed border-slate-300 pb-3">
          <div className="font-black text-sm text-slate-600 flex items-center gap-2"><HelpCircle className="w-4 h-4"/> 내 아이템</div>
          {me.item && (
            <button 
              onClick={() => handleUseItem(me.item.type)}
              disabled={!isMyTurn || me.item.used || (me.item.type === 'reroll' && !isFirstTurn) || (me.item.type === 'reverse' && roundReverseUsed)}
              className={`flex items-center gap-2 px-4 py-2 border-4 border-black rounded-full font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform ${me.item.used ? 'bg-slate-300 text-slate-500 grayscale' : `${ITEMS[me.item.type].color} hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0`}`}
            >
              {React.createElement(ITEMS[me.item.type].icon, { className: "w-5 h-5 text-black" })}
              {ITEMS[me.item.type].name} 사용하기
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 bg-white border-4 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[200px]">
            <div className={`w-14 h-14 rounded-full border-4 border-black ${me.avatar} flex items-center justify-center relative`}><User className="w-8 h-8 text-black" /></div>
            <div>
              <div className="font-black text-lg">{me.nickname} <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">나</span></div>
              <div className="flex gap-3 text-sm font-bold text-slate-600 mt-1"><span className="flex items-center gap-1"><Coins className="w-4 h-4 text-yellow-500" /> {me.money.toLocaleString()}원</span></div>
            </div>
          </div>

          <div className="flex flex-col gap-1 max-w-[250px] md:max-w-[350px] p-2">
            <div className="flex gap-2 overflow-x-auto hide-scrollbar items-center">
              {me.cards.length === 0 ? (
                <span className="text-sm font-bold text-slate-400">획득한 카드 없음</span>
              ) : (
                me.cards.map((c, i) => <JobCard key={i} cardId={c} isMini={true} />)
              )}
            </div>
            {me.cards.length > 0 && (
              <div className="text-[10px] md:text-xs font-bold text-slate-600 truncate">
                보유 번호: {me.cards.slice().sort((a, b) => a - b).join(', ')}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 min-w-[280px]">
            <div className="flex gap-2">
              <button onClick={() => handlePass(players.findIndex(p => p.isMe))} disabled={!isMyTurn || phase !== 'bidding' || mustBid} className="flex-1 py-3 bg-red-400 hover:bg-red-300 disabled:bg-slate-300 text-black border-4 border-black rounded-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all">포기 {mustBid && '불가!'}</button>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex bg-white border-4 border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <button onClick={() => setBidInput(Math.max(highestBid + 1000, bidInput - 1000))} disabled={!isMyTurn || phase !== 'bidding'} className="px-3 bg-slate-200 hover:bg-slate-300 font-black">-</button>
                  <div className="flex-1 text-center py-2 font-black">{bidInput.toLocaleString()}</div>
                  <button onClick={() => setBidInput(bidInput + 1000)} disabled={!isMyTurn || phase !== 'bidding'} className="px-3 bg-slate-200 hover:bg-slate-300 font-black">+</button>
                </div>
                <button onClick={() => handleBid(players.findIndex(p => p.isMe), bidInput)} disabled={!isMyTurn || phase !== 'bidding' || !canBid} className="w-full py-2 bg-green-400 hover:bg-green-300 disabled:bg-slate-300 text-black border-4 border-black rounded-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all">베팅하기</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// 2단계: 부동산 경매 화면
// ----------------------------------------------------------------------
const GamePhase2 = ({ initialPlayers, onComplete }) => {
  const [players, setPlayers] = useState(initialPlayers.map(p => ({ ...p, selectedCard: null })));
  const [deck, setDeck] = useState([]);
  const [revealedCards, setRevealedCards] = useState([]);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(10);
  const [phase, setPhase] = useState('selecting'); 
  const [mySelectedCard, setMySelectedCard] = useState(null);

  // 엿보기 모달 상태
  const [peekState, setPeekState] = useState({ active: false, targetId: null, targetValue: null, targetName: '' });

  const stateRef = useRef({ players, phase, revealedCards });
  useEffect(() => { stateRef.current = { players, phase, revealedCards }; }, [players, phase, revealedCards]);

  useEffect(() => {
    const fullDeck = [...Array.from({length: 15}, (_, i) => i + 1), ...Array.from({length: 15}, (_, i) => i + 1)];
    const shuffled = fullDeck.sort(() => Math.random() - 0.5);
    const numPlayers = players.length;
    setRevealedCards(shuffled.slice(0, numPlayers).sort((a, b) => b - a));
    setDeck(shuffled.slice(numPlayers));
  }, []);

  useEffect(() => {
    if (phase !== 'selecting') return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { forceSubmitUnselected(); return 10; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'selecting') return;
    const { players: currentPlayers } = stateRef.current;
    currentPlayers.forEach((p) => {
      if (!p.isMe && !p.selectedCard && p.cards.length > 0) {
        const delay = 2000 + Math.random() * 4000;
        setTimeout(() => {
          if (stateRef.current.phase !== 'selecting') return;
          const randomCard = p.cards[Math.floor(Math.random() * p.cards.length)];
          submitCard(p.id, randomCard);
        }, delay);
      }
    });
  }, [phase, round]);

  useEffect(() => {
    if (phase === 'selecting' && players.every(p => p.selectedCard !== null)) setPhase('revealing');
  }, [players, phase]);

  useEffect(() => {
    if (phase === 'revealing') {
      const t = setTimeout(() => setPhase('distributing'), 2000);
      return () => clearTimeout(t);
    } else if (phase === 'distributing') {
      distributeCards();
      const t = setTimeout(() => startNextRound(), 3000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const forceSubmitUnselected = () => {
    let changed = false;
    let newPlayers = stateRef.current.players.map(p => {
      if (!p.selectedCard) { changed = true; return { ...p, selectedCard: Math.min(...p.cards) }; }
      return p;
    });
    if (changed) setPlayers(newPlayers);
  };

  const submitCard = (playerId, cardId) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, selectedCard: cardId } : p));
    if (playerId === 'me') setMySelectedCard(null); 
  };

  const distributeCards = () => {
    const curPlayers = stateRef.current.players;
    const submissions = curPlayers.map(p => ({ playerId: p.id, card: p.selectedCard })).sort((a, b) => b.card - a.card);
    const sortedEstates = [...stateRef.current.revealedCards].sort((a, b) => b - a);

    let newPlayers = [...curPlayers];
    submissions.forEach((sub, idx) => {
      const pIndex = newPlayers.findIndex(p => p.id === sub.playerId);
      newPlayers[pIndex] = { ...newPlayers[pIndex], cards: newPlayers[pIndex].cards.filter(c => c !== sub.card), realEstates: [...newPlayers[pIndex].realEstates, sortedEstates[idx]] };
    });
    setPlayers(newPlayers);
  };

  const startNextRound = () => {
    const numPlayers = players.length;
    if (deck.length < numPlayers) { setPhase('phase2End'); return; }
    setRevealedCards([...deck].splice(0, numPlayers).sort((a, b) => b - a));
    setDeck(deck.slice(numPlayers));
    setRound(r => r + 1); setTimeLeft(10);
    setPlayers(prev => prev.map(p => ({ ...p, selectedCard: null })));
    setPhase('selecting');
  };

  // ------------------------------------------------------------------
  // 아이템 사용 로직 (2단계)
  // ------------------------------------------------------------------
  const handleUseItem = (type) => {
    const me = players.find(p => p.isMe);
    if (me.item?.type !== type || me.item.used) return;

    if (type === 'reroll') {
      if (phase !== 'selecting' || me.selectedCard) { showError('리롤은 카드 제출 전, 라운드 시작 직후에만 쓸 수 있습니다!'); return; }
      const numPlayers = players.length;
      const newRevealed = deck.slice(0, numPlayers).sort((a,b)=>b-a);
      const newDeck = [...deck.slice(numPlayers), ...revealedCards].sort(() => Math.random() - 0.5);
      setRevealedCards(newRevealed);
      setDeck(newDeck);
      setPlayers(prev => prev.map(p => p.isMe ? { ...p, item: { ...p.item, used: true } } : p));
    } 
    else if (type === 'peek') {
      if (phase !== 'selecting') return;
      setPeekState({ active: true, targetId: null, targetValue: null, targetName: '' });
    }
  };

  const executePeek = (targetPlayer) => {
    setPeekState({ active: true, targetId: targetPlayer.id, targetValue: targetPlayer.realEstates, targetName: targetPlayer.nickname });
    setPlayers(prev => prev.map(p => p.isMe ? { ...p, item: { ...p.item, used: true } } : p));
    setTimeout(() => setPeekState({ active: false, targetId: null, targetValue: null, targetName: '' }), 4000); 
  };

  const me = players.find(p => p.isMe);

  return (
    <div className="w-full max-w-4xl bg-white border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[85vh] animate-in slide-in-from-bottom-8 relative">
      
      {/* 엿보기 모달 */}
      {peekState.active && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center animate-in zoom-in">
            <Eye className="w-16 h-16 text-purple-600 mb-4" />
            {!peekState.targetId ? (
              <>
                <h3 className="text-2xl font-black mb-4">누구의 부동산을 엿볼까요?</h3>
                <div className="flex gap-4 w-full">
                  {players.filter(p => !p.isMe).map(p => (
                    <button key={p.id} onClick={() => executePeek(p)} className="flex-1 p-4 border-4 border-black rounded-xl hover:bg-slate-100 font-black text-lg flex flex-col items-center gap-2 transition-transform hover:-translate-y-1">
                       <div className={`w-12 h-12 rounded-full border-4 border-black ${p.avatar} flex items-center justify-center`}><User className="w-6 h-6 text-black" /></div>
                       {p.nickname}
                    </button>
                  ))}
                </div>
                <button onClick={() => setPeekState({ active: false, targetId: null, targetValue: null })} className="mt-4 px-6 py-2 bg-slate-200 border-4 border-black rounded-full font-bold">취소</button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-black mb-2 text-blue-600">비밀 정보 획득!</h3>
                <p className="font-bold text-slate-600 mb-4"><span className="text-black font-black">{peekState.targetName}</span> 님의 보유 부동산입니다.</p>
                <div className="bg-slate-100 border-4 border-black border-dashed rounded-xl p-4 w-full flex gap-2 overflow-x-auto">
                  {peekState.targetValue.length === 0 ? (
                    <span className="text-slate-500 font-bold m-auto">아직 획득한 부동산이 없습니다.</span>
                  ) : (
                    peekState.targetValue.map((c, i) => <RealEstateCard key={i} cardId={c} isMini={true} />)
                  )}
                </div>
                <p className="mt-4 text-sm font-bold text-slate-400 animate-pulse">4초 후 자동으로 닫힙니다...</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* 상대방 영역 */}
      <div className="bg-slate-100 p-4 border-b-4 border-black flex justify-center gap-6 relative">
        <div className="absolute top-4 left-4 font-black text-xl flex flex-col">
          <span className="bg-black text-white px-3 py-1 rounded-full text-sm self-start mb-1">Phase 2. 부동산 경매</span>라운드 {round}
        </div>
        {players.filter(p => !p.isMe).map(p => (
          <div key={p.id} className="relative flex flex-col items-center p-3 border-4 border-black rounded-xl w-28 md:w-32 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className={`w-12 h-12 rounded-full border-4 border-black ${p.avatar} flex items-center justify-center mb-2 relative`}>
              <User className="w-6 h-6 text-black" />
              <PlayerItemBadge item={p.item} />
            </div>
            <span className="font-bold text-sm truncate w-full text-center">{p.nickname}</span>
            <div className="mt-2 w-full flex justify-center">
              {p.selectedCard ? <span className="text-xs font-black bg-green-400 text-black px-2 py-1 rounded border-2 border-black flex items-center gap-1"><Check className="w-3 h-3"/> 제출완료</span> : <span className="text-xs font-bold bg-slate-200 text-slate-500 px-2 py-1 rounded">고민중..</span>}
            </div>
          </div>
        ))}
      </div>

      {/* 중앙 보드 */}
      <div className="flex-1 bg-blue-50 p-6 flex flex-col items-center justify-center relative">
        {phase === 'phase2End' ? (
          <div className="text-center animate-in zoom-in duration-500">
            <h2 className="text-4xl font-black mb-4">모든 경매가 종료되었습니다!</h2>
            <button onClick={() => onComplete(players)} className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-black border-4 border-black rounded-xl font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-2 mx-auto">최종 결과 확인하기 <Trophy className="w-6 h-6" /></button>
          </div>
        ) : (
          <>
            {phase === 'selecting' && <div className="absolute top-6 flex items-center gap-2 bg-white border-4 border-black px-4 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Timer className="w-6 h-6 text-red-500 animate-pulse" /><span className="font-black text-xl text-red-500">{timeLeft}초 남음</span></div>}
            {(phase === 'revealing' || phase === 'distributing') && <div className="absolute top-6 bg-yellow-400 text-black border-4 border-black px-6 py-2 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-xl animate-bounce">카드 공개! 가장 높은 카드가 우선권을 갖습니다!</div>}
            <div className="flex items-center gap-4 md:gap-8 mb-8">
              <div className="w-20 h-32 md:w-28 md:h-40 bg-slate-800 border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-[-5deg] relative">
                <span className="text-white font-black text-center text-sm px-2 border-2 border-white rounded-lg p-1 opacity-70">부동산<br/>카드</span>
              </div>
              <ArrowRight className="w-8 h-8 text-slate-400 mx-2" />
              <div className="flex gap-2 md:gap-4">{revealedCards.map((card, idx) => <RealEstateCard key={`estate-${idx}`} cardId={card} />)}</div>
            </div>
            <div className="flex gap-4 md:gap-8 mt-4 bg-white/50 p-4 rounded-2xl border-4 border-black border-dashed">
              <span className="absolute -top-3 left-4 bg-white px-2 font-black text-sm border-2 border-black rounded-full">제출된 직업 카드</span>
              {players.map(p => {
                if (!p.selectedCard) return <div key={`empty-${p.id}`} className="w-20 h-32 md:w-28 md:h-40 border-4 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-white/50"><span className="text-slate-400 font-bold text-sm">{p.nickname}<br/>대기중</span></div>;
                return (
                  <div key={`sub-${p.id}`} className="relative flex flex-col items-center">
                     <span className="text-xs font-black bg-black text-white px-2 py-0.5 rounded-full mb-2 z-10">{p.nickname}</span>
                     <JobCard cardId={p.selectedCard} isHidden={phase === 'selecting'} isSelected={phase === 'distributing' && [...players].sort((a,b)=>b.selectedCard-a.selectedCard).findIndex(x => x.id === p.id) === 0}/>
                     {phase === 'distributing' && <div className="absolute -bottom-6 animate-bounce"><span className="bg-green-400 text-black text-xs font-black px-2 py-1 border-2 border-black rounded-full">{[...players].sort((a,b)=>b.selectedCard-a.selectedCard).findIndex(x => x.id === p.id) + 1}순위!</span></div>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 하단 내 컨트롤 영역 */}
      <div className="p-4 md:p-6 border-t-4 border-black bg-slate-50 flex flex-col gap-4">
        
        {/* 아이템 패널 */}
        <div className="flex justify-between items-center border-b-2 border-dashed border-slate-300 pb-3">
          <div className="font-black text-sm text-slate-600 flex items-center gap-2"><HelpCircle className="w-4 h-4"/> 내 아이템</div>
          {me.item && (
            <button 
              onClick={() => handleUseItem(me.item.type)}
              disabled={phase !== 'selecting' || me.item.used || me.selectedCard || me.item.type === 'reverse'}
              className={`flex items-center gap-2 px-4 py-2 border-4 border-black rounded-full font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform ${me.item.used || me.item.type === 'reverse' ? 'bg-slate-300 text-slate-500 grayscale' : `${ITEMS[me.item.type].color} hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0`}`}
            >
              {React.createElement(ITEMS[me.item.type].icon, { className: "w-5 h-5 text-black" })}
              {me.item.type === 'reverse' ? '사용불가(1단계 전용)' : `${ITEMS[me.item.type].name} 사용하기`}
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 w-full md:w-1/3">
            <div className={`w-14 h-14 rounded-full border-4 border-black ${me.avatar} flex-none flex items-center justify-center`}><User className="w-8 h-8 text-black" /></div>
            <div className="flex flex-col flex-1">
               <div className="font-black text-lg">{me.nickname} <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">나</span></div>
               <div className="text-sm font-bold text-slate-600 mb-1"><Coins className="w-4 h-4 text-yellow-500 inline mr-1" />{me.money.toLocaleString()}원</div>
               <div className="flex flex-col gap-1 max-w-full pb-1">
                 <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                   {me.realEstates.length === 0 ? (
                     <span className="text-xs font-bold text-slate-400">부동산 없음</span>
                   ) : (
                     me.realEstates.map((c, i) => <RealEstateCard key={`re-${i}`} cardId={c} isMini={true} />)
                   )}
                 </div>
                 {me.realEstates.length > 0 && (
                   <div className="text-[10px] md:text-xs font-bold text-slate-600 truncate">
                     보유 부동산 번호: {me.realEstates.slice().sort((a, b) => a - b).join(', ')} (총 {me.realEstates.reduce((sum, c) => sum + c * 1000, 0).toLocaleString()}원)
                   </div>
                 )}
               </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col w-full md:w-2/3 border-l-0 md:border-l-4 border-black pl-0 md:pl-4">
            <div className="flex justify-between items-end mb-2">
              <span className="font-black text-sm bg-black text-white px-3 py-1 rounded-full">내 직업 카드에서 선택하세요</span>
              {me.selectedCard && <span className="text-green-600 font-bold text-sm">제출 완료!</span>}
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pt-2 items-center">
               {me.cards.map((c, i) => <JobCard key={`myjob-${i}`} cardId={c} isMini={true} isSelected={mySelectedCard === c || me.selectedCard === c} onClick={() => { if (phase === 'selecting' && !me.selectedCard) setMySelectedCard(c); }}/>)}
            </div>
            {phase === 'selecting' && !me.selectedCard && <button onClick={() => { if(mySelectedCard) submitCard(me.id, mySelectedCard); }} disabled={!mySelectedCard} className="mt-2 w-full py-3 bg-blue-500 hover:bg-blue-400 disabled:bg-slate-300 text-white font-black text-lg rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all">{mySelectedCard ? `${mySelectedCard}번 카드 제출하기` : '카드를 먼저 선택하세요'}</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 결과 화면
// ----------------------------------------------------------------------
const ResultScreen = ({ players, onReplay }) => {
  const calculatedPlayers = players.map(p => {
    const estateValue = p.realEstates.reduce((sum, c) => sum + (c * 1000), 0);
    const finalScore = p.money + estateValue;
    return { ...p, estateValue, finalScore };
  }).sort((a, b) => b.finalScore - a.finalScore);

  return (
    <div className="w-full max-w-3xl bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col animate-in zoom-in duration-500">
      <div className="text-center mb-8 relative">
        <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4 absolute -top-12 left-1/2 -translate-x-1/2 drop-shadow-md" />
        <h1 className="text-5xl font-black mb-2 mt-4 text-orange-500 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">최종 자산 순위</h1>
        <p className="font-bold text-slate-600">누가 진정한 영끌 로드의 승자일까요?</p>
      </div>
      <div className="flex flex-col gap-4 mb-8">
        {calculatedPlayers.map((p, idx) => {
          const isWinner = idx === 0;
          return (
            <div key={p.id} className={`flex items-center gap-4 p-4 border-4 border-black rounded-2xl relative ${isWinner ? 'bg-yellow-100 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform scale-105 z-10' : 'bg-slate-50'}`}>
              <div className="w-12 text-center font-black text-2xl flex flex-col items-center">{idx === 0 ? <Medal className="w-8 h-8 text-yellow-500" /> : idx === 1 ? <Medal className="w-8 h-8 text-slate-400" /> : idx === 2 ? <Medal className="w-8 h-8 text-orange-400" /> : <span>{idx + 1}</span>}</div>
              <div className={`w-16 h-16 rounded-full border-4 border-black ${p.avatar} flex items-center justify-center`}><User className="w-8 h-8 text-black" /></div>
              <div className="flex-1">
                <div className="font-black text-xl flex items-center gap-2">{p.nickname} {p.isMe && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">나</span>}</div>
                <div className="flex gap-2 text-sm font-bold text-slate-500 mt-1"><span>보유 현금: {p.money.toLocaleString()}원</span><span className="text-slate-300">|</span><span>부동산 가치: {p.estateValue.toLocaleString()}원</span></div>
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold text-slate-500 mb-1">최종 자산</span>
                <span className={`font-black text-2xl md:text-3xl ${isWinner ? 'text-red-500' : 'text-blue-600'}`}>{p.finalScore.toLocaleString()}원</span>
              </div>
              {isWinner && <div className="absolute -top-3 -right-3 bg-red-500 text-white font-black px-3 py-1 rounded-full border-2 border-black rotate-12 animate-pulse">우승!</div>}
            </div>
          );
        })}
      </div>
      <button onClick={onReplay} className="w-full py-5 bg-blue-400 hover:bg-blue-300 text-black border-4 border-black rounded-xl font-black text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"><Home className="w-6 h-6" /> 로비로 돌아가기</button>
    </div>
  );
};