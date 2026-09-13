"use client";

import { useState } from "react";
import type { BirthInfo, FortuneResult as FortuneResultData } from "@/types/fortune";

interface FortuneResultProps {
  birthInfo: BirthInfo;
  fortune: FortuneResultData;
  onEdit: () => void;
  onRetry: () => void;
}

const GENDER_LABEL: Record<BirthInfo["gender"], string> = {
  female: "여성",
  male: "남성",
  other: "기타",
};

function formatBirthDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatBirthTime(timeStr: string, isUnknown: boolean): string {
  if (isUnknown || !timeStr) return "시간 모름";
  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const period = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${hour12}시 ${String(minute).padStart(2, "0")}분`;
}

export default function FortuneResult({ birthInfo, fortune, onEdit, onRetry }: FortuneResultProps) {
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const secondaryCategories = [
    { title: "재물운", data: fortune.wealth },
    { title: "연애운", data: fortune.love },
    { title: "직장 · 학업운", data: fortune.career },
    { title: "건강운", data: fortune.health },
  ];

  async function handleShare() {
    const shareText = `${birthInfo.name}님의 오늘의 운세 - 종합운 ${fortune.overall.score}점\n${fortune.message}`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: "오늘의 운세", text: shareText, url: shareUrl });
      } catch {
        // 사용자가 공유 시트를 취소한 경우 - 별도 처리 없이 무시
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("링크가 복사되었어요");
    } catch {
      setShareStatus("복사에 실패했어요. 주소창의 링크를 직접 복사해주세요.");
    }
    setTimeout(() => setShareStatus(null), 2500);
  }

  return (
    <div className="flex flex-col">
      {/* Hero result */}
      <div className="flex flex-col items-center border-t border-line pt-10 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">
          {formatBirthDate(birthInfo.birthDate)} · {formatBirthTime(birthInfo.birthTime, birthInfo.isBirthTimeUnknown)} ·{" "}
          {GENDER_LABEL[birthInfo.gender]}
        </p>
        <h2 className="mt-2 text-base font-medium text-ink-soft">{birthInfo.name}님의 오늘</h2>

        <div className="relative mt-6 flex h-32 w-32 shrink-0 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-line" aria-hidden />
          <span className="absolute inset-3 rounded-full border border-gold/50" aria-hidden />
          <p className="text-5xl font-semibold tracking-tight text-ink">
            {fortune.overall.score}
            <span className="mt-1 block text-[11px] font-normal tracking-[0.2em] text-ink-soft">/ 100</span>
          </p>
        </div>

        <p className="mt-6 max-w-[22rem] text-sm leading-relaxed text-ink-soft">{fortune.overall.description}</p>
      </div>

      {/* Secondary categories */}
      <div className="mt-10 divide-y divide-line border-y border-line">
        {secondaryCategories.map((category) => (
          <div key={category.title} className="flex items-center gap-4 py-4">
            <div className="w-[4.5rem] shrink-0 text-xs font-medium leading-tight text-ink-soft">
              {category.title}
            </div>
            <div className="min-w-0 flex-1">
              <div className="h-1 w-full overflow-hidden rounded-full bg-paper-raised">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${category.data.score}%` }}
                />
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">{category.data.description}</p>
            </div>
            <div className="w-8 shrink-0 text-right text-sm font-semibold text-ink">{category.data.score}</div>
          </div>
        ))}
      </div>

      {/* Today's message - pull quote */}
      <div className="mt-12 text-center">
        <span aria-hidden className="text-3xl leading-none text-gold">
          “
        </span>
        <p className="mx-auto -mt-1 max-w-xs text-lg font-medium leading-relaxed text-ink text-balance">
          {fortune.message}
        </p>
        <span aria-hidden className="mx-auto mt-4 block h-px w-10 bg-line" />
      </div>

      {/* Lucky items */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium uppercase tracking-wide text-ink-soft">Lucky Color</span>
          <span
            className="h-2.5 w-2.5 rounded-full border border-black/10"
            style={{ backgroundColor: fortune.luckyColor.hex }}
            aria-hidden
          />
          <span className="font-medium text-ink">{fortune.luckyColor.name}</span>
        </div>
        <span className="hidden h-3 w-px bg-line sm:block" aria-hidden />
        <div className="flex items-center gap-2">
          <span className="font-medium uppercase tracking-wide text-ink-soft">Lucky Number</span>
          <span className="font-semibold text-ink">{fortune.luckyNumber}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-12 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleShare}
          className="w-full rounded-full bg-ink px-6 py-3.5 text-sm font-semibold tracking-wide text-paper transition hover:opacity-90 active:scale-[0.98]"
        >
          결과 공유하기
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="w-full rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition hover:bg-paper-raised active:scale-[0.98]"
        >
          운세 다시 확인하기
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="mt-1 text-xs font-medium text-ink-soft underline-offset-4 transition hover:text-ink hover:underline"
        >
          출생 정보 수정
        </button>
      </div>
      {shareStatus && (
        <p role="status" className="mt-3 text-center text-xs text-ink-soft">
          {shareStatus}
        </p>
      )}
    </div>
  );
}
