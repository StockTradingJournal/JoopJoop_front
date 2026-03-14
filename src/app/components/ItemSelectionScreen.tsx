import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Eye, ArrowLeftRight, CheckCircle2, Clock } from 'lucide-react';
import { Player, PlayerItem, ItemType } from '../../lib/socket-types';
import { playClick } from '../../lib/audio';

const ITEM_SELECTION_TIME_LIMIT = 15; // 초

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
    desc: '카드를 다시 섞어 새로 배치합니다.',
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

function getRandomItem(): ItemType {
  const ids = ITEM_DEFS.map((d) => d.id);
  return ids[Math.floor(Math.random() * ids.length)];
}

export function ItemSelectionScreen({
  players,
  currentPlayerId,
  playerItems,
  onSelectItem,
}: ItemSelectionScreenProps) {
  const [selected, setSelected] = useState<ItemType | null>(null);
  const [timeLeft, setTimeLeft] = useState(ITEM_SELECTION_TIME_LIMIT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onSelectItemRef = useRef(onSelectItem);
  onSelectItemRef.current = onSelectItem;

  const me = players.find((p) => p.id === currentPlayerId);
  const myItem = playerItems[currentPlayerId];
  const alreadySelected = myItem?.item !== null && myItem?.item !== undefined;

  const allSelected = players.length > 0 && players.every((p) => {
    const pi = playerItems[p.id];
    return pi?.item != null;
  });

  // 15초 제한: 아직 선택 안 했을 때만 타이머 동작, 0이 되면 랜덤 선택
  useEffect(() => {
    if (alreadySelected || allSelected) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    setTimeLeft(ITEM_SELECTION_TIME_LIMIT);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          const randomItem = getRandomItem();
          setSelected(randomItem);
          onSelectItemRef.current(randomItem);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [alreadySelected, allSelected]); // onSelectItem은 안정적이라 의존성 생략 가능

  const handleSelect = (id: ItemType) => {
    if (alreadySelected) return;
    playClick();
    setSelected(id);
    onSelectItem(id);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-3 py-4 sm:p-4 font-sans"
      style={{
        backgroundColor: '#f3e8ff',
        backgroundImage: 'radial-gradient(#e9d5ff 20%, transparent 20%), radial-gradient(#e9d5ff 20%, transparent 20%)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px',
      }}
    >
      <div className="w-full max-w-3xl flex flex-col gap-2 sm:gap-4">
        {/* 헤더: 모바일에서 압축 */}
        <div className="text-center mb-1 sm:mb-2">
          <h2 className="text-2xl sm:text-4xl font-black text-purple-600 mb-0.5 sm:mb-1">아이템 획득 시간!</h2>
          <p className="text-xs sm:text-base font-bold text-slate-600 leading-tight">
            딱 <span className="text-red-500 font-black">1번</span> 쓸 수 있는 아이템 1개 고르세요.
          </p>
        </div>

        {allSelected ? (
          <div className="bg-white border-2 sm:border-4 border-black rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center animate-pulse">
            <CheckCircle2 className="w-14 h-14 sm:w-20 sm:h-20 text-green-500 mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-3xl font-black text-center">모두 선택 완료!<br className="sm:hidden" /> 1단계 경매 시작...</h3>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:gap-4">
            {/* 제한 시간: 한 줄로 압축 */}
            {!alreadySelected && (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-3 sm:px-4 bg-amber-100 border-2 sm:border-4 border-amber-500 rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-700 shrink-0" />
                <span className="font-black text-amber-800 text-sm sm:text-base whitespace-nowrap">
                  <span className="tabular-nums">{timeLeft}</span>초 안에 선택 (미선택 시 랜덤)
                </span>
              </div>
            )}

            {/* 아이템 카드: 모바일 3열 컴팩트, 데스크톱에서만 상세 */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {ITEM_DEFS.map((item) => {
                const Icon = item.icon;
                const isSelected = selected === item.id || myItem?.item === item.id;
                const locked = alreadySelected && !isSelected;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    disabled={alreadySelected}
                    className={`relative flex flex-col items-center p-2 sm:p-5 border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl text-center transition-transform active:scale-[0.98] min-h-0 ${
                      isSelected
                        ? 'bg-yellow-100 ring-2 sm:ring-4 ring-yellow-400 scale-[1.02] sm:scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                        : locked
                        ? 'bg-slate-100 opacity-40 cursor-not-allowed shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                        : 'bg-white cursor-pointer hover:-translate-y-1 sm:hover:-translate-y-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 sm:-top-3 sm:-right-3 bg-red-500 text-white font-black px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full border-2 border-black rotate-12 text-[10px] sm:text-sm">
                        선택완료!
                      </div>
                    )}
                    <div className={`w-10 h-10 sm:w-16 sm:h-16 ${item.color} rounded-full border-2 sm:border-4 border-black flex items-center justify-center mb-1 sm:mb-3 shrink-0`}>
                      <Icon className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-sm sm:text-xl font-black mb-0.5 sm:mb-1 leading-tight">{item.name}</h3>
                    <p className="text-[10px] sm:text-sm font-bold text-slate-600 mb-1 sm:mb-3 leading-tight line-clamp-[2] sm:line-clamp-none">{item.desc}</p>
                    <div className="w-full space-y-0.5 sm:space-y-1 hidden sm:block">
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

            {/* 다른 플레이어: 모바일 가로 스크롤, 컴팩트 칩 */}
            <div className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black text-xs sm:text-base mb-2 sm:mb-3 border-b-2 border-dashed border-slate-300 pb-1.5 sm:pb-2">
                다른 플레이어 선택 현황
              </h3>
              <div className={`grid gap-2 sm:gap-4 ${players.length <= 3 ? 'grid-cols-3' : 'grid-cols-3 grid-rows-2'}`}>
                {players.map((player, idx) => {
                  const isMe = player.id === currentPlayerId;
                  const pi = playerItems[player.id];
                  const chosen = pi?.item;
                  const chosenDef = chosen ? ITEM_DEFS.find((d) => d.id === chosen) : null;
                  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  const avatar = AVATARS[idx % AVATARS.length];
                  return (
                    <div key={player.id} className={`flex flex-col items-center gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 border-black min-w-0 ${isMe ? 'bg-blue-50 border-blue-400' : 'bg-slate-50'}`}>
                      <div className={`relative w-9 h-9 sm:w-12 sm:h-12 ${color} rounded-full border-2 sm:border-[3px] border-black flex items-center justify-center text-base sm:text-xl`}>
                        {avatar}
                        {chosen && chosenDef && (
                          <div className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4 h-4 sm:w-6 sm:h-6 ${chosenDef.color} rounded-full border-2 border-black flex items-center justify-center`}>
                            {(() => { const Icon = chosenDef.icon; return <Icon className="w-2 h-2 sm:w-3 sm:h-3 text-white" />; })()}
                          </div>
                        )}
                      </div>
                      <span className="font-black text-[10px] sm:text-xs truncate max-w-[64px] sm:max-w-none text-center">{isMe ? '나' : player.nickname}</span>
                      {chosen && chosenDef ? (
                        <span className={`text-[9px] sm:text-[10px] font-black text-white ${chosenDef.color} px-1.5 py-0.5 rounded-full border border-black`}>
                          {chosenDef.name}
                        </span>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">고민 중</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {alreadySelected && (
              <div className="text-center bg-green-100 border-2 sm:border-4 border-green-400 rounded-lg sm:rounded-xl py-2 sm:py-4 px-3 font-black text-green-700 text-sm sm:text-base">
                ✅ 선택 완료! 다른 플레이어를 기다리는 중...
              </div>
            )}
          </div>
        )}

        {/* 하단 진행 표시 */}
        {!allSelected && (
          <div className="text-center mt-0 sm:mt-2">
            <span className="font-bold text-slate-600 text-xs sm:text-sm">
              선택 완료: {Object.values(playerItems).filter((pi) => pi?.item != null).length} / {players.length}명
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
