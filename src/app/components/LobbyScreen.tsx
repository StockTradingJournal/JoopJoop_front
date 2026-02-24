import { useState, useRef, useEffect } from 'react';
import { Users, Crown, CheckCircle2, Send, Copy, Check } from 'lucide-react';
import { gameSocket } from '../../lib/gameSocket';
import { Player } from '../../lib/socket-types';

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
  const canStart = me?.isHost && players.length >= 2 && allNonHostReady;

  useEffect(() => {
    const handler = (data: ChatMessage) => {
      setChatMessages((prev) => [...prev, data]);
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
      className="min-h-screen flex flex-col items-center justify-center p-4 font-sans"
      style={{
        backgroundColor: '#e0f2fe',
        backgroundImage: 'radial-gradient(#bae6fd 20%, transparent 20%), radial-gradient(#bae6fd 20%, transparent 20%)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <span className="text-blue-600 font-bold text-sm">대기방</span>
            <h2 className="text-2xl font-black leading-none">모두 준비하면 시작!</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 border-4 border-black rounded-xl px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-2xl font-black tracking-widest text-blue-600">{roomCode}</span>
            </div>
            <button
              onClick={copyCode}
              className="p-2 bg-white border-4 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-100 transition-all"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Players grid */}
        <div className="bg-white border-4 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
          <h3 className="font-black text-lg mb-4 border-b-4 border-black pb-2 flex items-center gap-2">
            <Users className="w-5 h-5" /> 참여자 ({players.length}/6)
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {players.map((player, idx) => {
              const isMe = player.id === currentPlayerId;
              const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const avatar = AVATARS[idx % AVATARS.length];
              return (
                <div
                  key={player.id}
                  className={`flex flex-col items-center p-3 border-4 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all ${
                    player.isReady || player.isHost ? 'bg-green-50' : 'bg-white'
                  } ${isMe ? 'ring-4 ring-blue-400' : ''}`}
                >
                  <div className={`relative w-14 h-14 ${color} rounded-full border-4 border-black flex items-center justify-center text-2xl mb-2`}>
                    {avatar}
                    {player.isHost && (
                      <div className="absolute -top-2 -left-2 bg-yellow-400 rounded-full p-1 border-2 border-black">
                        <Crown className="w-3 h-3 text-yellow-700 fill-yellow-400" />
                      </div>
                    )}
                    {(player.isReady || player.isHost) && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                        <CheckCircle2 className="w-3 h-3 text-white fill-green-500" />
                      </div>
                    )}
                  </div>
                  <span className="font-black text-sm truncate max-w-full">{player.nickname}</span>
                  {isMe && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold mt-1">나</span>}
                </div>
              );
            })}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="flex flex-col items-center p-3 border-4 border-dashed border-slate-300 rounded-xl">
                <div className="w-14 h-14 rounded-full border-4 border-dashed border-slate-300 flex items-center justify-center text-2xl mb-2 text-slate-300">
                  ?
                </div>
                <span className="font-bold text-sm text-slate-300">대기 중</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
          <div className="h-20 overflow-y-auto mb-2 space-y-1">
            {chatMessages.length === 0 ? (
              <p className="text-slate-400 text-sm italic text-center py-3">채팅 메시지가 없습니다</p>
            ) : (
              <>
                {chatMessages.map((msg, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-black text-blue-600">{msg.nickname}:</span>{' '}
                    <span className="font-semibold">{msg.message}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendChat(); }}
              placeholder="메시지를 입력하세요..."
              maxLength={100}
              className="flex-1 h-10 px-3 rounded-xl bg-slate-100 border-4 border-black text-sm font-semibold focus:outline-none"
            />
            <button
              onClick={sendChat}
              disabled={!chatInput.trim()}
              className="w-10 h-10 bg-blue-400 rounded-xl border-4 border-black flex items-center justify-center disabled:bg-slate-200 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:brightness-110"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={onLeaveRoom}
            className="px-6 py-4 bg-slate-200 border-4 border-black rounded-xl font-black text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
          >
            나가기
          </button>

          {me?.isHost ? (
            <button
              onClick={onStartGame}
              disabled={!canStart}
              className="flex-1 py-4 bg-green-400 disabled:bg-slate-300 disabled:cursor-not-allowed border-4 border-black rounded-xl font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
            >
              {canStart ? '아이템 선택으로 이동! →' : `${players.length}명 / 2명 이상 + 모두 준비 필요`}
            </button>
          ) : (
            <button
              onClick={onReady}
              className={`flex-1 py-4 border-4 border-black rounded-xl font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all ${
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
