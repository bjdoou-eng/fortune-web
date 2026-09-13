"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FortuneForm from "@/components/FortuneForm";
import FortuneResult from "@/components/FortuneResult";
import { generateFortune } from "@/lib/fortune";
import { clearBirthInfo, loadBirthInfo, saveBirthInfo } from "@/lib/storage";
import type { BirthInfo } from "@/types/fortune";

export default function Home() {
  const [birthInfo, setBirthInfo] = useState<BirthInfo | null>(null);
  const [shouldScrollToResult, setShouldScrollToResult] = useState(false);

  const formSectionRef = useRef<HTMLDivElement>(null);
  const resultSectionRef = useRef<HTMLDivElement>(null);

  // Restore previously entered info on mount only - keeps server/client
  // markup identical during hydration, then progressively enhances.
  useEffect(() => {
    const stored = loadBirthInfo();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration-safe read from localStorage, not a state derived from props/render
    if (stored) setBirthInfo(stored);
  }, []);

  useEffect(() => {
    if (shouldScrollToResult && resultSectionRef.current) {
      resultSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setShouldScrollToResult(false);
    }
  }, [shouldScrollToResult]);

  const fortune = useMemo(() => {
    if (!birthInfo) return null;
    return generateFortune(birthInfo);
  }, [birthInfo]);

  function handleFormSubmit(info: BirthInfo) {
    setBirthInfo(info);
    saveBirthInfo(info);
    setShouldScrollToResult(true);
  }

  function handleEdit() {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Resets everything back to a blank form rather than reshuffling the
  // result - the same name + birth date on the same day must always produce
  // the same fortune, so "다시 확인하기" starts over instead of re-rolling.
  function handleRetry() {
    setBirthInfo(null);
    clearBirthInfo();
    handleEdit();
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-paper px-5 py-10 text-ink sm:py-14">
      <div className="w-full max-w-md">
        <header className="mb-10 text-center">
          <svg
            width="72"
            height="24"
            viewBox="0 0 72 24"
            fill="none"
            aria-hidden
            className="mx-auto mb-5 text-ink-soft/40"
          >
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1" />
            <line x1="27" y1="12" x2="57" y2="12" stroke="currentColor" strokeWidth="1" />
            <circle cx="62" cy="12" r="1.5" fill="currentColor" />
          </svg>
          <h1 className="text-[1.7rem] font-semibold leading-snug tracking-tight text-balance">
            오늘, 나에게 어떤 흐름이 찾아올까요?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft text-balance">
            이름과 태어난 정보를 알려주시면 오늘 하루의 기운을 짚어드릴게요.
          </p>
        </header>

        <div ref={formSectionRef} className="scroll-mt-10 border-t border-line pt-8">
          <FortuneForm initialValues={birthInfo} onSubmit={handleFormSubmit} />
        </div>

        {fortune && birthInfo && (
          <div ref={resultSectionRef} className="scroll-mt-10 animate-fortune-reveal">
            <FortuneResult
              birthInfo={birthInfo}
              fortune={fortune}
              onEdit={handleEdit}
              onRetry={handleRetry}
            />
          </div>
        )}

        <p className="mt-14 border-t border-line pt-6 text-center text-[11px] leading-relaxed text-ink-soft/70">
          ✳ 본 결과는 재미로 즐기는 콘텐츠이며 실제 사주 명리학 계산과는 무관합니다.
        </p>
      </div>
    </div>
  );
}
