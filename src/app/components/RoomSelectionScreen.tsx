import { useEffect, useState } from 'react';
import { PlusCircle, KeyRound, Zap, BookOpen, ArrowRight, RefreshCw, AlertCircle, User, CheckCircle2 } from 'lucide-react';
import { playClick } from '../../lib/audio';

type QuickMatchStage = 'idle' | 'searching' | 'found_countdown';

interface RoomSelectionScreenProps {
  nickname: string;
  isNicknameSaved: boolean;
  onSaveNickname: (nickname: string) => void;
  onStartNicknameEdit: () => void;
  onCreateRoom: () => void;
  onJoinByCode: (code: string) => void;
  onStartMatchQueue: (playerCount: number) => Promise<void>;
  onCancelMatchQueue: () => void;
  onShowHelp: () => void;
  onExitRoomMenu: () => void;
  /** True while waiting for match after successful join_match_queue */
  isMatchmaking: boolean;
  quickMatchStage: QuickMatchStage;
  quickMatchCountdown: number | null;
  quickMatchNotice: string | null;
  /** 부모가 설정한 큐 인원(결과 화면에서 재매칭 등) — 대기 문구에 사용 */
  waitingPlayerCount?: number;
}

export function RoomSelectionScreen({
  nickname,
  isNicknameSaved,
  onSaveNickname,
  onStartNicknameEdit,
  onCreateRoom,
  onJoinByCode,
  onStartMatchQueue,
  onCancelMatchQueue,
  onShowHelp,
  onExitRoomMenu,
  isMatchmaking,
  quickMatchStage,
  quickMatchCountdown,
  quickMatchNotice,
  waitingPlayerCount,
}: RoomSelectionScreenProps) {
  const [showCodePopup, setShowCodePopup] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [quickUi, setQuickUi] = useState<'closed' | 'select' | 'waiting'>('closed');
  const [matchTarget, setMatchTarget] = useState(3);
  const [error, setError] = useState('');
  const [nicknameInput, setNicknameInput] = useState(nickname);
  const [isEditingNickname, setIsEditingNickname] = useState(!isNicknameSaved);

  useEffect(() => {
    setNicknameInput(nickname);
  }, [nickname]);

  useEffect(() => {
    setIsEditingNickname(!isNicknameSaved);
  }, [isNicknameSaved]);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const closeAllPopups = () => {
    setShowCodePopup(false);
    setCodeInput('');
    setQuickUi('closed');
  };

  const handleConfirmCode = () => {
    if (!isNicknameSaved) {
      showError('닉네임 저장 후 참가할 수 있습니다.');
      return;
    }
    const c = codeInput.trim().toUpperCase();
    if (c.length < 4) {
      showError('방 코드를 확인해주세요.');
      return;
    }
    playClick();
    onJoinByCode(c);
    closeAllPopups();
  };

  const handleConfirmQuickMatch = async () => {
    if (!isNicknameSaved) {
      showError('닉네임 저장 후 빠른 참가를 이용해주세요.');
      return;
    }
    playClick();
    setQuickUi('waiting');
    try {
      await onStartMatchQueue(matchTarget);
    } catch (e) {
      showError(e instanceof Error ? e.message : '매칭 대기에 실패했습니다.');
      setQuickUi('select');
    }
  };

  const handleCancelMatch = () => {
    playClick();
    onCancelMatchQueue();
    setQuickUi('closed');
  };

  const overlayOpen =
    showCodePopup || quickUi === 'select' || quickUi === 'waiting' || isMatchmaking || quickMatchStage !== 'idle';

  const displayMatchCount = waitingPlayerCount ?? matchTarget;
  const canJoin = isNicknameSaved && nickname.trim().length > 0;

  const handleSaveNickname = () => {
    const trimmed = nicknameInput.trim();
    if (!trimmed) {
      showError('닉네임을 입력해주세요.');
      return;
    }
    if (trimmed.length > 8) {
      showError('닉네임은 최대 8자입니다.');
      return;
    }
    playClick();
    onSaveNickname(trimmed);
    setIsEditingNickname(false);
  };

  const handleStartEditNickname = () => {
    playClick();
    onStartNicknameEdit();
    setNicknameInput(nickname);
    setIsEditingNickname(true);
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
        <div className="fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-md z-[60] bg-red-400 border-2 sm:border-4 border-black text-black font-bold px-4 py-2.5 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="w-full max-w-lg relative">
        <div className="bg-white border-2 sm:border-4 border-black rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-300 relative">
          {/* Popups: above main content */}
          {overlayOpen && (
            <div
              className="absolute inset-0 z-40 flex items-center justify-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/92 backdrop-blur-sm border-2 sm:border-4 border-black"
              aria-modal="true"
              role="dialog"
            >
              {showCodePopup && (
                <div className="w-full max-w-sm flex flex-col items-center text-center">
                  <KeyRound className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 mb-3 sm:mb-4" />
                  <h3 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4">입장할 방 코드 입력</h3>
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="6자리 코드"
                    className="w-full text-center text-2xl sm:text-3xl font-black tracking-widest p-3 sm:p-4 border-2 sm:border-4 border-black rounded-xl mb-4 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  />
                  <div className="flex w-full gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        closeAllPopups();
                      }}
                      className="flex-1 min-h-[44px] py-3 bg-slate-200 border-2 sm:border-4 border-black rounded-xl font-bold"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCode}
                      className="flex-1 min-h-[44px] py-3 bg-blue-500 text-white border-2 sm:border-4 border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                    >
                      확인
                    </button>
                  </div>
                </div>
              )}

              {quickUi === 'select' && !showCodePopup && (
                <div className="w-full max-w-sm flex flex-col items-center text-center">
                  <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mb-3 sm:mb-4" />
                  <h3 className="text-xl sm:text-2xl font-black mb-1 sm:mb-2">원하는 인원 선택</h3>
                  <p className="text-slate-500 font-bold text-sm sm:text-base mb-4 sm:mb-6">3명 ~ 6명까지 같은 인원끼리 매칭됩니다.</p>
                  <div className="flex gap-2 mb-6 w-full justify-between">
                    {[3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          playClick();
                          setMatchTarget(num);
                        }}
                        className={`flex-1 min-h-[44px] py-2.5 sm:py-3 border-2 sm:border-4 border-black rounded-xl font-black text-base sm:text-xl transition-all ${
                          matchTarget === num
                            ? 'bg-yellow-400 shadow-[inset_0px_-4px_0px_0px_rgba(0,0,0,0.2)]'
                            : 'bg-white hover:bg-slate-100'
                        }`}
                      >
                        {num}명
                      </button>
                    ))}
                  </div>
                  <div className="flex w-full gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        setQuickUi('closed');
                      }}
                      className="flex-1 min-h-[44px] py-3 bg-slate-200 border-2 sm:border-4 border-black rounded-xl font-bold"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmQuickMatch}
                      className="flex-1 min-h-[44px] py-3 bg-green-400 text-black border-2 sm:border-4 border-black rounded-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                    >
                      확인
                    </button>
                  </div>
                </div>
              )}

              {(quickUi === 'waiting' || isMatchmaking || quickMatchStage === 'searching') && !showCodePopup && quickUi !== 'select' && quickMatchStage !== 'found_countdown' && (
                <div className="w-full max-w-sm flex flex-col items-center text-center">
                  <RefreshCw className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 mb-3 sm:mb-4 animate-spin" />
                  <h3 className="text-xl sm:text-2xl font-black mb-2">게임 찾는 중</h3>
                  <p className="text-slate-600 font-bold text-sm sm:text-base mb-2">
                    같은 인원({displayMatchCount}명)을 선택한 플레이어를 찾는 중이에요.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 mb-6">모이면 게임 대기 없이 바로 시작합니다.</p>
                  <button
                    type="button"
                    onClick={handleCancelMatch}
                    className="px-8 min-h-[44px] py-3 bg-red-400 text-white border-2 sm:border-4 border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                  >
                    매칭 취소
                  </button>
                </div>
              )}

              {quickMatchStage === 'found_countdown' && !showCodePopup && (
                <div className="w-full max-w-sm flex flex-col items-center text-center">
                  <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mb-3 sm:mb-4" />
                  <h3 className="text-2xl sm:text-3xl font-black mb-2 text-green-700">게임 발견!</h3>
                  <p className="text-slate-700 font-black text-sm sm:text-base mb-1">
                    {quickMatchNotice ?? '빠른 매칭이 성사되었습니다.'}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 mb-5">서버에 연결 중... 잠시 후 게임이 시작됩니다.</p>
                  <div className="w-20 h-20 rounded-full bg-green-100 border-4 border-black flex items-center justify-center text-3xl font-black text-green-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {quickMatchCountdown ?? 3}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-start gap-2 mb-4 sm:mb-6 border-b-2 sm:border-b-4 border-black pb-3 sm:pb-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] sm:text-xs font-black uppercase tracking-wide text-slate-500 mb-0.5">방 참가 메뉴</p>
              <h2 className="text-xl sm:text-2xl font-black leading-tight">환영합니다!</h2>
              {isEditingNickname ? (
                <div className="mt-2 flex flex-col sm:flex-row gap-2">
                  <label className="sr-only" htmlFor="nickname-input">닉네임</label>
                  <div className="flex-1 flex items-center gap-2 rounded-xl border-2 border-black bg-slate-50 px-2.5">
                    <User className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <input
                      id="nickname-input"
                      type="text"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      maxLength={8}
                      placeholder="닉네임 입력"
                      className="w-full bg-transparent py-2 text-base font-bold outline-none"
                      onKeyDown={(e) => {
                        if (e.nativeEvent.isComposing) return;
                        if (e.key === 'Enter') handleSaveNickname();
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveNickname}
                    className="min-h-[42px] px-4 py-2 bg-blue-500 text-white border-2 border-black rounded-xl font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
                  >
                    저장
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex flex-col sm:flex-row gap-2 sm:items-center">
                  <p className="text-blue-600 font-bold text-base sm:text-lg truncate">
                    {nickname} <span className="text-sm text-slate-500 font-bold">입주자님</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleStartEditNickname}
                    className="w-fit min-h-[38px] px-3 py-1.5 bg-slate-100 border-2 border-black rounded-xl text-xs sm:text-sm font-black hover:bg-slate-200"
                  >
                    변경
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                playClick();
                onExitRoomMenu();
              }}
              className="flex flex-col items-center gap-0.5 p-1.5 sm:p-2 border-2 border-slate-300 rounded-xl hover:bg-slate-100 text-slate-600 touch-manipulation flex-shrink-0 max-w-[5.5rem]"
              title="화면 초기화"
              aria-label="방 참가 화면 초기화"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="text-[10px] sm:text-[11px] font-black leading-tight text-center">초기화</span>
            </button>
          </div>
          {!canJoin && (
            <p className="mb-3 text-sm font-bold text-amber-700 bg-amber-100 border-2 border-black rounded-lg px-3 py-2">
              방 만들기, 코드 참가, 빠른 참가는 닉네임 저장 후 이용할 수 있습니다.
            </p>
          )}

          <div className="flex flex-col gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                if (!canJoin) {
                  showError('닉네임 저장 후 방을 만들 수 있습니다.');
                  return;
                }
                playClick();
                onCreateRoom();
              }}
              disabled={!canJoin}
              className={`w-full min-h-[52px] sm:min-h-[56px] p-4 sm:p-5 text-black border-2 sm:border-4 border-black rounded-2xl font-black text-lg sm:text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-between group touch-manipulation ${canJoin ? 'bg-green-400 hover:bg-green-300' : 'bg-slate-300 text-slate-600 cursor-not-allowed opacity-80'}`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <PlusCircle className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 group-hover:rotate-90 transition-transform" />
                <span className="truncate">방 만들기</span>
              </span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (!canJoin) {
                  showError('닉네임 저장 후 코드 참가가 가능합니다.');
                  return;
                }
                playClick();
                setShowCodePopup(true);
                setCodeInput('');
              }}
              disabled={!canJoin}
              className={`w-full min-h-[52px] sm:min-h-[56px] p-4 sm:p-5 border-2 sm:border-4 border-black rounded-2xl font-black text-lg sm:text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-between group touch-manipulation ${canJoin ? 'bg-blue-400 hover:bg-blue-300 text-white' : 'bg-slate-300 text-slate-600 cursor-not-allowed opacity-80'}`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <KeyRound className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" />
                <span className="truncate">코드로 입장하기</span>
              </span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (!canJoin) {
                  showError('닉네임 저장 후 빠른 참가가 가능합니다.');
                  return;
                }
                playClick();
                setQuickUi('select');
                setMatchTarget(3);
              }}
              disabled={!canJoin}
              className={`w-full min-h-[52px] sm:min-h-[56px] p-4 sm:p-5 text-black border-2 sm:border-4 border-black rounded-2xl font-black text-lg sm:text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-between group touch-manipulation ${canJoin ? 'bg-yellow-400 hover:bg-yellow-300' : 'bg-slate-300 text-slate-600 cursor-not-allowed opacity-80'}`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Zap className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 text-red-500" />
                <span className="truncate">빠른 참가</span>
              </span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>

            <div className="border-t-2 sm:border-t-4 border-black border-dashed my-1 sm:my-2" />

            <button
              type="button"
              onClick={() => {
                playClick();
                onShowHelp();
              }}
              className="w-full min-h-[48px] p-3 sm:p-4 bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 sm:border-4 border-black rounded-2xl font-black text-base sm:text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 touch-manipulation"
            >
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              도움말 (게임 룰)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
