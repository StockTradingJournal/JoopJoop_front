import { useState } from 'react';
import { RefreshCw, Eye, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { Player, PlayerItem, ItemType } from '../../lib/socket-types';

const AVATARS = ['🧑', '👩', '🧔', '👱', '🧕', '👴'];
const AVATAR_COLORS = [
  'bg-yellow-300', 'bg-pink-300', 'bg-cyan-300',
  'bg-green-300', 'bg-purple-300', 'bg-orange-300',
];

interface ItemDef {
  id: ItemType;
  name: string;
  color: string;
  icon: typeof RefreshCw;
  desc: string;
  phase1: string;
  phase2: string;
}

const ITEM_DEFS: ItemDef[] = [
  {
    id: 'reroll',
    name: '리롤',
    color: 'bg-blue-400',
    icon: RefreshCw,
    desc: '현재 라운드의 카드를 다시 섞어 새로 배치합니다.',
    phase1: '첫 번째 턴(아무도 베팅 안 했을 때)에만 사용 가능',
    phase2: '카드 제출 전, 라운드 시작 시 사용 가능',
  },
  {
    id: 'peek',
    name: '엿보기',
    color: 'bg-purple-400',
    icon: Eye,
    desc: '상대 1명의 비밀 정보를 확인합니다.',
    phase1: '내 턴 언제나 사용 가능 → 상대방 남은 돈 확인',
    phase2: '언제나 사용 가능 → 상대방 보유 부동산 카드 확인',
  },
  {
    id: 'reverse',
    name: '리버스',
    color: 'bg-orange-400',
    icon: ArrowLeftRight,
    desc: '경매 순서를 영구적으로 반대로 바꿉니다.',
    phase1: '내 턴에 사용 → 사용 즉시 반드시 베팅해야 함. 한 라운드에 1회만 사용 가능',
    phase2: '사용 불가 (1단계 전용)',
  },
];

interface ItemSelectionScreenProps {
  players: Player[];
  currentPlayerId: string;
  playerItems: Record<string, PlayerItem>;
  onSelectItem: (item: ItemType) => void;
}

export function ItemSelectionScreen({
  players,
  currentPlayerId,
  playerItems,
  onSelectItem,
}: ItemSelectionScreenProps) {
  const [selected, setSelected] = useState<ItemType | null>(null);

  const me = players.find((p) => p.id === currentPlayerId);
  const myItem = playerItems[currentPlayerId];
  const alreadySelected = myItem?.item !== null && myItem?.item !== undefined;

  const allSelected = players.length > 0 && players.every((p) => {
    const pi = playerItems[p.id];
    return pi?.item != null;
  });

  const handleSelect = (id: ItemType) => {
    if (alreadySelected) return;
    setSelected(id);
    onSelectItem(id);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 font-sans"
      style={{
        backgroundColor: '#f3e8ff',
        backgroundImage: 'radial-gradient(#e9d5ff 20%, transparent 20%), radial-gradient(#e9d5ff 20%, transparent 20%)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
      }}
    >
      <div className="w-full max-w-3xl">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-black text-purple-600 mb-1">아이템 획득 시간!</h2>
          <p className="text-base font-bold text-slate-600">
            게임 전체에서 딱 <span className="text-red-500 font-black">1번</span> 사용할 수 있는 특수 아이템을 1개 고르세요.
          </p>
        </div>

        {allSelected ? (
          <div className="bg-white border-4 border-black rounded-3xl p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center animate-pulse">
            <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
            <h3 className="text-3xl font-black">모두 선택 완료! 1단계 경매 시작...</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Item cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ITEM_DEFS.map((item) => {
                const Icon = item.icon;
                const isSelected = selected === item.id || myItem?.item === item.id;
                const locked = alreadySelected && !isSelected;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    disabled={alreadySelected}
                    className={`relative flex flex-col items-center p-5 border-4 border-black rounded-2xl text-left transition-transform ${
                      isSelected
                        ? 'bg-yellow-100 ring-4 ring-yellow-400 scale-105 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                        : locked
                        ? 'bg-slate-100 opacity-40 cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : `bg-white cursor-pointer hover:-translate-y-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-3 -right-3 bg-red-500 text-white font-black px-3 py-1 rounded-full border-2 border-black rotate-12 text-sm">
                        선택완료!
                      </div>
                    )}
                    <div className={`w-16 h-16 ${item.color} rounded-full border-4 border-black flex items-center justify-center mb-3`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black mb-1">{item.name}</h3>
                    <p className="text-sm font-bold text-slate-600 mb-3 text-center leading-snug">{item.desc}</p>
                    <div className="w-full space-y-1">
                      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-2">
                        <span className="text-[10px] font-black text-yellow-700">1단계:</span>
                        <p className="text-[11px] font-bold text-slate-700 leading-tight">{item.phase1}</p>
                      </div>
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-2">
                        <span className="text-[10px] font-black text-blue-700">2단계:</span>
                        <p className="text-[11px] font-bold text-slate-700 leading-tight">{item.phase2}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Other players' selection status */}
            <div className="bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black text-base mb-3 border-b-2 border-dashed border-slate-300 pb-2">
                다른 플레이어 선택 현황
              </h3>
              <div className="flex gap-4 flex-wrap">
                {players.map((player, idx) => {
                  const isMe = player.id === currentPlayerId;
                  const pi = playerItems[player.id];
                  const chosen = pi?.item;
                  const chosenDef = chosen ? ITEM_DEFS.find((d) => d.id === chosen) : null;
                  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  const avatar = AVATARS[idx % AVATARS.length];
                  return (
                    <div key={player.id} className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-black ${isMe ? 'bg-blue-50 border-blue-400' : 'bg-slate-50'}`}>
                      <div className={`relative w-12 h-12 ${color} rounded-full border-3 border-black flex items-center justify-center text-xl`}>
                        {avatar}
                        {chosen && chosenDef && (
                          <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${chosenDef.color} rounded-full border-2 border-black flex items-center justify-center`}>
                            {(() => { const Icon = chosenDef.icon; return <Icon className="w-3 h-3 text-white" />; })()}
                          </div>
                        )}
                      </div>
                      <span className="font-black text-xs">{isMe ? `${player.nickname} (나)` : player.nickname}</span>
                      {chosen && chosenDef ? (
                        <span className={`text-[10px] font-black text-white ${chosenDef.color} px-2 py-0.5 rounded-full border border-black`}>
                          {chosenDef.name}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">고민 중...</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {alreadySelected && (
              <div className="text-center bg-green-100 border-4 border-green-400 rounded-xl p-4 font-black text-green-700">
                ✅ 선택 완료! 다른 플레이어를 기다리는 중...
              </div>
            )}
          </div>
        )}

        {/* Waiting indicator */}
        {!allSelected && (
          <div className="mt-4 text-center">
            <span className="font-bold text-slate-600 text-sm">
              선택 완료: {Object.values(playerItems).filter((pi) => pi?.item != null).length} / {players.length}명
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
