import { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Crown, Home, User, Zap } from 'lucide-react';
import { playClick } from '../../lib/audio';

interface HelpScreenProps {
  onBack: () => void;
}

const PAGES = [
  {
    title: '게임 목표',
    icon: Crown,
    accent: 'text-blue-600',
    body: (
      <>
        <p className="text-base sm:text-lg font-bold leading-relaxed text-slate-700">
          시작 자본 <span className="bg-yellow-200 px-2 rounded">15,000원</span>으로{' '}
          <span className="bg-blue-200 px-2 rounded">부동산</span>을 가장 많이 모으는 사람이 이깁니다.
        </p>
        <p className="mt-4 text-base font-bold text-slate-700">
          최종 점수 = <b>남은 돈</b> + <b>부동산 카드 숫자 합 × 1,000원</b>
        </p>
      </>
    ),
  },
  {
    title: '1단계 · 직업 경매',
    icon: User,
    accent: 'text-yellow-700',
    body: (
      <ul className="list-disc list-inside space-y-3 font-bold text-slate-700 text-base sm:text-lg">
        <li>매 라운드 참가자 수만큼 직업 카드(1~30)가 깔립니다.</li>
        <li>돌아가며 1,000원 단위로 베팅하거나 포기합니다.</li>
        <li>
          <b>포기:</b> 바닥에 남은 카드 중 <span className="text-red-600">가장 낮은 숫자</span>를 가져가고, 베팅금의 절반(천 원 미만 버림)을 돌려받습니다.
        </li>
        <li>
          <b>최후 1인:</b> 가장 높은 직업 카드를 가져가지만, 베팅금은 돌려받지 못합니다.
        </li>
      </ul>
    ),
  },
  {
    title: '2단계 · 부동산 경매',
    icon: Home,
    accent: 'text-purple-700',
    body: (
      <ul className="list-disc list-inside space-y-3 font-bold text-slate-700 text-base sm:text-lg">
        <li>매 라운드 부동산 카드(1~15)가 깔립니다.</li>
        <li>각자 직업 카드 1장을 <b>비공개로 동시에 제출</b>합니다.</li>
        <li>공개 후 <span className="text-blue-600">가장 높은 직업 카드</span>를 낸 사람부터 좋은 부동산을 가져갑니다.</li>
        <li>낸 직업 카드는 버려집니다.</li>
      </ul>
    ),
  },
  {
    title: '특수 아이템',
    icon: Zap,
    accent: 'text-green-700',
    body: (
      <div className="space-y-4 text-slate-700">
        <p className="font-bold text-base">게임 시작 전 <b>1개</b>만 고르며, 게임 중 <b>단 1번</b> 사용할 수 있습니다.</p>
        <div className="space-y-3 text-sm sm:text-base font-bold">
          <p>
            <span className="text-blue-600">리롤</span> — 라운드 직후 바닥 카드를 다시 뽑습니다.
          </p>
          <p>
            <span className="text-purple-600">엿보기</span> — 상대 1명의 돈(1단계) 또는 부동산(2단계)을 몰래 봅니다.
          </p>
          <p>
            <span className="text-orange-600">리버스</span> — 1단계 본인 턴에 턴 순서를 반대로. 사용 시 포기 불가.
          </p>
        </div>
      </div>
    ),
  },
];

export function HelpScreen({ onBack }: HelpScreenProps) {
  const [page, setPage] = useState(0);
  const total = PAGES.length;
  const current = PAGES[page];
  const Icon = current.icon;

  const goPrev = () => {
    playClick();
    setPage((p) => Math.max(0, p - 1));
  };
  const goNext = () => {
    playClick();
    setPage((p) => Math.min(total - 1, p + 1));
  };

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex flex-col items-center font-sans overflow-hidden"
      style={{
        backgroundColor: '#f8fafc',
        padding: 'max(env(safe-area-inset-top), 0.5rem) max(env(safe-area-inset-right), 1rem) max(env(safe-area-inset-bottom), 0.5rem) max(env(safe-area-inset-left), 1rem)',
      }}
    >
      <div className="w-full max-w-3xl flex-1 flex flex-col min-h-0 max-h-[min(100dvh,900px)]">
        <div className="bg-blue-500 p-3 sm:p-4 border-2 sm:border-4 border-black flex items-center justify-between text-white flex-shrink-0 rounded-t-2xl">
          <button
            type="button"
            onClick={() => {
              playClick();
              onBack();
            }}
            className="p-2 bg-black hover:bg-slate-800 rounded-full transition-colors touch-manipulation"
            aria-label="뒤로"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg sm:text-2xl font-black flex items-center gap-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" /> 게임 규칙
          </h2>
          <div className="w-10" aria-hidden />
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 border-x-2 sm:border-x-4 border-black p-4 sm:p-6 md:p-8">
          <div className="bg-white p-5 sm:p-6 border-2 sm:border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[200px]">
            <div className={`flex items-center gap-2 mb-4 ${current.accent}`}>
              <Icon className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
              <h3 className="text-xl sm:text-2xl font-black">{current.title}</h3>
            </div>
            {current.body}
          </div>
          <div className="flex items-center justify-center gap-2 mt-6">
            {PAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  playClick();
                  setPage(i);
                }}
                className={`h-2.5 rounded-full transition-all touch-manipulation ${i === page ? 'w-8 bg-blue-500' : 'w-2.5 bg-slate-300'}`}
                aria-label={`${i + 1}페이지`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 bg-white border-2 sm:border-4 border-t-0 border-black rounded-b-2xl flex-shrink-0">
          <button
            type="button"
            onClick={goPrev}
            disabled={page === 0}
            className="flex-1 min-h-[48px] py-3 rounded-xl border-2 sm:border-4 border-black font-black bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 touch-manipulation"
          >
            <ChevronLeft className="w-5 h-5" /> 이전
          </button>
          {page < total - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 min-h-[48px] py-3 rounded-xl border-2 sm:border-4 border-black font-black bg-blue-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center justify-center gap-1 touch-manipulation"
            >
              다음 <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                playClick();
                onBack();
              }}
              className="flex-1 min-h-[48px] py-3 rounded-xl border-2 sm:border-4 border-black font-black bg-green-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 touch-manipulation"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
