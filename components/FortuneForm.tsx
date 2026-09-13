"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { BirthInfo, FortuneFormErrors, Gender } from "@/types/fortune";

interface FortuneFormProps {
  initialValues: BirthInfo | null;
  onSubmit: (info: BirthInfo) => void;
}

interface FormState {
  name: string;
  birthDate: string;
  birthTime: string;
  isBirthTimeUnknown: boolean;
  gender: Gender | "";
}

const EMPTY_FORM: FormState = {
  name: "",
  birthDate: "",
  birthTime: "",
  isBirthTimeUnknown: false,
  gender: "",
};

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "female", label: "여성" },
  { value: "male", label: "남성" },
  { value: "other", label: "기타" },
];

const LABEL_CLASS = "text-xs font-medium uppercase tracking-wide text-ink-soft";

const INPUT_CLASS =
  "rounded-lg border border-line bg-paper-raised px-3.5 py-2.5 text-[15px] text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-soft disabled:cursor-not-allowed disabled:text-ink-soft/60";

const ERROR_CLASS = "text-xs text-[#b3492e]";

function validate(form: FormState): FortuneFormErrors {
  const errors: FortuneFormErrors = {};
  const trimmedName = form.name.trim();

  if (!trimmedName) {
    errors.name = "이름을 입력해주세요.";
  } else if (trimmedName.length > 20) {
    errors.name = "이름은 20자 이하로 입력해주세요.";
  }

  if (!form.birthDate) {
    errors.birthDate = "생년월일을 입력해주세요.";
  } else {
    const inputDate = new Date(form.birthDate);
    if (Number.isNaN(inputDate.getTime())) {
      errors.birthDate = "올바른 날짜 형식으로 입력해주세요.";
    } else if (inputDate.getTime() > Date.now()) {
      errors.birthDate = "미래의 날짜는 입력할 수 없어요.";
    }
  }

  if (!form.isBirthTimeUnknown && !form.birthTime) {
    errors.birthTime = "태어난 시간을 입력하거나 '모름'을 선택해주세요.";
  }

  if (!form.gender) {
    errors.gender = "성별을 선택해주세요.";
  }

  return errors;
}

export default function FortuneForm({ initialValues, onSubmit }: FortuneFormProps) {
  const [form, setForm] = useState<FormState>(initialValues ?? EMPTY_FORM);
  const [errors, setErrors] = useState<FortuneFormErrors>({});

  // Loading previously saved birth info from localStorage happens after mount
  // (see app/page.tsx), so sync it into the form once it arrives.
  useEffect(() => {
    if (initialValues) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncs the form once with data hydrated asynchronously from localStorage in the parent
      setForm(initialValues);
    }
  }, [initialValues]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name: form.name.trim(),
      birthDate: form.birthDate,
      birthTime: form.isBirthTimeUnknown ? "" : form.birthTime,
      isBirthTimeUnknown: form.isBirthTimeUnknown,
      gender: form.gender as Gender,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fortune-name" className={LABEL_CLASS}>
          이름
        </label>
        <input
          id="fortune-name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="이름을 입력해주세요"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "fortune-name-error" : undefined}
          className={INPUT_CLASS}
        />
        {errors.name && (
          <p id="fortune-name-error" role="alert" className={ERROR_CLASS}>
            {errors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fortune-birth-date" className={LABEL_CLASS}>
          생년월일
        </label>
        <input
          id="fortune-birth-date"
          type="date"
          value={form.birthDate}
          onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
          aria-invalid={Boolean(errors.birthDate)}
          aria-describedby={errors.birthDate ? "fortune-birth-date-error" : undefined}
          className={INPUT_CLASS}
        />
        {errors.birthDate && (
          <p id="fortune-birth-date-error" role="alert" className={ERROR_CLASS}>
            {errors.birthDate}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="fortune-birth-time" className={LABEL_CLASS}>
            태어난 시간
          </label>
          <label
            htmlFor="fortune-birth-time-unknown"
            className="flex cursor-pointer items-center gap-1.5 text-xs text-ink-soft"
          >
            <input
              id="fortune-birth-time-unknown"
              type="checkbox"
              checked={form.isBirthTimeUnknown}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  isBirthTimeUnknown: e.target.checked,
                  birthTime: e.target.checked ? "" : f.birthTime,
                }))
              }
              className="peer sr-only"
            />
            <span className="rounded-full border border-line px-2.5 py-1 transition peer-checked:border-accent peer-checked:bg-accent-soft peer-checked:text-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent-soft">
              시간 모름
            </span>
          </label>
        </div>
        <input
          id="fortune-birth-time"
          type="time"
          value={form.birthTime}
          disabled={form.isBirthTimeUnknown}
          onChange={(e) => setForm((f) => ({ ...f, birthTime: e.target.value }))}
          aria-invalid={Boolean(errors.birthTime)}
          aria-describedby={errors.birthTime ? "fortune-birth-time-error" : undefined}
          className={INPUT_CLASS}
        />
        {errors.birthTime && (
          <p id="fortune-birth-time-error" role="alert" className={ERROR_CLASS}>
            {errors.birthTime}
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className={LABEL_CLASS}>성별</legend>
        <div
          role="radiogroup"
          aria-describedby={errors.gender ? "fortune-gender-error" : undefined}
          className="flex divide-x divide-line overflow-hidden rounded-lg border border-line"
        >
          {GENDER_OPTIONS.map((option) => {
            const id = `fortune-gender-${option.value}`;
            const checked = form.gender === option.value;
            return (
              <label
                key={option.value}
                htmlFor={id}
                className={`flex-1 cursor-pointer py-2 text-center text-[13px] font-medium transition ${
                  checked ? "bg-accent-soft text-accent" : "bg-paper-raised text-ink-soft hover:text-ink"
                }`}
              >
                <input
                  id={id}
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={checked}
                  onChange={() => setForm((f) => ({ ...f, gender: option.value }))}
                  className="sr-only"
                />
                {option.label}
              </label>
            );
          })}
        </div>
        {errors.gender && (
          <p id="fortune-gender-error" role="alert" className={ERROR_CLASS}>
            {errors.gender}
          </p>
        )}
      </fieldset>

      <button
        type="submit"
        className="mt-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-semibold tracking-wide text-paper transition hover:opacity-90 active:scale-[0.98]"
      >
        운세 확인하기
      </button>
    </form>
  );
}
