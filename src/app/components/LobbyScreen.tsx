import { useState, useRef, useEffect } from 'react';
import { Users, Crown, CheckCircle2, Send, Copy, Check } from 'lucide-react';
import { gameSocket } from '../../lib/gameSocket';
import { Player } from '../../lib/socket-types';
import { playClick } from '../../lib/audio';

const AVATARS = ['🧑', '👩', '🧔', '👱', '🧕', '👴'];
const AVATAR_COLORS = [
  'bg-yellow-300', 'bg-pink-300', 'bg-cyan-300',
  'bg-green-300', 'bg-purple-300', 'bg-orange-300',
];

interface ChatMessage {
  playerId: string;
  nickname: string;
  message: string;
}

interface LobbyScreenProps {
  roomCode: string;
  players: Player[];
  currentPlayerId: string;
  onReady: () => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export function LobbyScreen({
  roomCode, players, currentPlayerId, onReady, onStartGame, onLeaveRoom,
}: LobbyScreenProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const me = players.find((p) => p.id === currentPlayerId);
  const allNonHostReady = players.filter((p) => !p.isHost).every((p) => p.isReady);
  const canStart = me?.isHost && players.length >= 3 && allNonHostReady;

  useEffect(() => {
    const handler = (data: ChatMessage) => {
      setChatMessages((prev) => [...prev.slice(-19), data]);
    };
    gameSocket.onChatMessage(handler);
    return () => gameSocket.offChatMessage(handler);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChat = () => {
    if (chatInput.trim()) {
      gameSocket.sendChatMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex flex-col items-center font-sans overflow-y-auto"
      style={{
        backgroundColor: '#e0f2fe',
        backgroundImage: 'radial-gradient(#bae6fd 20%, transparent 20%), radial-gradient(#bae6fd 20%, transparent 20%)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
        padding: 'max(env(safe-area-inset-top), 0.5rem) max(env(safe-area-inset-right), 1rem) max(env(safe-area-inset-bottom), 0.5rem) max(env(safe-area-inset-left), 1rem)',
      }}
    >
      <div className="w-full max-w-2xl flex-1 flex flex-col py-3 sm:py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3 sm:mb-4 bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="min-w-0">
            {/* <span className="text-blue-600 font-bold text-xs sm:text-sm">대기방</span> */}
            <h2 className="text-lg sm:text-2xl font-black leading-tight"> 모두 준비하면 시작!</h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-slate-100 border-2 sm:border-4 border-black rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-lg sm:text-2xl font-black tracking-widest text-blue-600">{roomCode}</span>
            </div>
            <button
              onClick={copyCode}
              className="p-1.5 sm:p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-white border-2 sm:border-4 border-black rounded-lg sm:rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100 transition-all touch-manipulation"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Players grid */}
        <div className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-3 sm:mb-4">
          <h3 className="font-black text-base sm:text-lg mb-3 sm:mb-4 border-b-2 sm:border-b-4 border-black pb-1.5 sm:pb-2 flex items-center gap-1.5 sm:gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 참여자 ({players.length}/6)
          </h3>
          <div className="grid grid-cols-3 grid-rows-2 gap-2 sm:gap-3">
            {players.map((player, idx) => {
              const isMe = player.id === currentPlayerId;
              const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const avatar = AVATARS[idx % AVATARS.length];
              return (
                <div
                  key={player.id}
                  className={`flex flex-col items-center p-2 sm:p-3 border-2 sm:border-4 border-black rounded-lg sm:rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all min-w-0 min-h-[7rem] sm:min-h-[7.5rem] ${
                    player.isReady || player.isHost ? 'bg-green-50' : 'bg-white'
                  } ${isMe ? 'ring-2 sm:ring-4 ring-blue-400' : ''}`}
                >
                  <div className={`relative w-11 h-11 sm:w-14 sm:h-14 ${color} rounded-full border-2 sm:border-4 border-black flex items-center justify-center text-lg sm:text-2xl mb-1 sm:mb-2 flex-shrink-0`}>
                    {avatar}
                    {player.isHost && (
                      <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 bg-yellow-400 rounded-full p-0.5 sm:p-1 border-2 border-black">
                        <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-700 fill-yellow-400" />
                      </div>
                    )}
                    {(player.isReady || player.isHost) && (
                      <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white fill-green-500" />
                      </div>
                    )}
                  </div>
                  <span className="font-black text-xs sm:text-sm truncate max-w-full text-center">{player.nickname}</span>
                  {isMe && <span className="text-[10px] sm:text-xs bg-blue-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full font-bold mt-0.5 sm:mt-1">나</span>}
                </div>
              );
            })}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex flex-col items-center p-2 sm:p-3 border-2 sm:border-4 border-dashed border-slate-300 rounded-lg sm:rounded-xl min-w-0 min-h-[7rem] sm:min-h-[7.5rem]">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 sm:border-4 border-dashed border-slate-300 flex items-center justify-center text-lg sm:text-2xl mb-1 sm:mb-2 text-slate-300 flex-shrink-0">
                  ?
                </div>
                <span className="font-bold text-xs sm:text-sm text-slate-300">대기 중</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-3 sm:mb-4 flex flex-col">
          <div className="h-[10.5rem] sm:h-[16rem] md:h-[20rem] overflow-y-auto mb-2 space-y-1 flex-shrink-0 overflow-x-hidden">
            {chatMessages.length === 0 ? (
              <p className="text-slate-400 text-xs sm:text-sm italic text-center py-2 sm:py-3">채팅 메시지가 없습니다</p>
            ) : (
              <>
                {chatMessages.map((msg, i) => (
                  <div key={i} className="text-xs sm:text-sm break-words">
                    <span className="font-black text-blue-600">{msg.nickname}:</span>{' '}
                    <span className="font-semibold">{msg.message}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0 mt-auto relative z-10">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === 'Enter') {
                  e.preventDefault();
                  sendChat();
                }
              }}
              placeholder="메시지를 입력하세요..."
              maxLength={100}
              className="flex-1 min-h-[44px] px-3 py-2 rounded-lg sm:rounded-xl bg-slate-100 border-2 sm:border-4 border-black text-sm font-semibold focus:outline-none min-w-0"
            />
            <button
              type="button"
              onClick={sendChat}
              disabled={!chatInput.trim()}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-blue-400 rounded-lg sm:rounded-xl border-2 sm:border-4 border-black disabled:bg-slate-200 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:brightness-110 touch-manipulation flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 sm:gap-3 flex-shrink-0 relative z-10">
          <button
            onClick={() => { playClick(); onLeaveRoom(); }}
            className="min-h-[48px] px-4 sm:px-6 py-3 sm:py-4 bg-slate-200 border-2 sm:border-4 border-black rounded-lg sm:rounded-xl font-black text-sm sm:text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all touch-manipulation"
          >
            나가기
          </button>

          {me?.isHost ? (
            <>
              {players.length < 6 && (
                <button
                  onClick={() => { playClick(); gameSocket.addBot(); }}
                  className="min-h-[48px] px-3 sm:px-4 py-3 sm:py-4 bg-purple-400 border-2 sm:border-4 border-black rounded-lg sm:rounded-xl font-black text-sm sm:text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all whitespace-nowrap touch-manipulation"
                  title="혼자 테스트할 때 사용하세요"
                >
                  🤖 봇 추가
                </button>
              )}
              <button
                onClick={() => { playClick(); onStartGame(); }}
                disabled={!canStart}
                className="min-h-[48px] flex-1 min-w-0 py-3 sm:py-4 px-3 bg-green-400 disabled:bg-slate-300 disabled:cursor-not-allowed border-2 sm:border-4 border-black rounded-lg sm:rounded-xl font-black text-base sm:text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all touch-manipulation"
              >
                {players.length <= 2
                  ? '게임은 3명부터 가능'
                  : allNonHostReady
                    ? '게임 시작!'
                    : '모든 플레이어 준비 필요'}
              </button>
            </>
          ) : (
            <button
              onClick={() => { playClick(); onReady(); }}
              className={`min-h-[48px] flex-1 min-w-0 py-3 sm:py-4 border-2 sm:border-4 border-black rounded-lg sm:rounded-xl font-black text-base sm:text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all touch-manipulation ${
                me?.isReady ? 'bg-red-400' : 'bg-green-400'
              }`}
            >
              {me?.isReady ? '준비 취소' : '준비 완료'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
