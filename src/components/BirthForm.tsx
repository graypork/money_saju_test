"use client";

import {
  FormEvent,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { uiTokens } from "../lib/uiTokens";

type PickerOption = {
  label: string;
  value: string;
};

type PickerKey = "year" | "month" | "day" | "time" | null;
type CalendarType = "solar" | "lunar";
type ParsedBirthDate = {
  year: string;
  month: string;
  day: string;
  normalized: string;
};

const PICKER_SHEET_HEIGHT = 420;
const PICKER_VIEWPORT_MARGIN = 16;
const DEFAULT_PICKER_TOP = 96;

function getDaysInMonth(year: string, month: string) {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

function formatBirthDate(year: string, month: string, day: string) {
  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}

function parseBirthDateInput(
  value: string,
  currentYear: number
): ParsedBirthDate | null {
  const cleaned = value
    .trim()
    .replace(/[./\s]+/g, "-")
    .replace(/[년월]/g, "-")
    .replace(/일/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const compactMatch = cleaned.match(/^(\d{4})(\d{2})(\d{2})$/);
  const separatedMatch = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const match = compactMatch || separatedMatch;

  if (!match) return null;

  const parsedYear = Number(match[1]);
  const parsedMonth = Number(match[2]);
  const parsedDay = Number(match[3]);

  if (parsedYear < 1940 || parsedYear > currentYear) return null;
  if (parsedMonth < 1 || parsedMonth > 12) return null;
  if (parsedDay < 1) return null;

  const year = String(parsedYear);
  const month = String(parsedMonth).padStart(2, "0");
  const day = String(parsedDay).padStart(2, "0");

  if (parsedDay > getDaysInMonth(year, month)) return null;

  return {
    year,
    month,
    day,
    normalized: formatBirthDate(year, month, day),
  };
}

function PickerButton({
  label,
  value,
  placeholder,
  onClick,
}: {
  label: string;
  value: string;
  placeholder: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[18px] border border-black/10 bg-[#F8F4EC] px-3 py-4 text-left text-base font-extrabold text-[#171C18] outline-none transition active:scale-[0.98] active:bg-[#EEF3EA]"
    >
      <span className={value ? "text-[#171C18]" : "text-[#7D7469]"}>
        {value ? label : placeholder}
      </span>
    </button>
  );
}

function PickerSheet({
  title,
  options,
  selectedValue,
  anchorTop,
  onSelect,
  onClose,
}: {
  title: string;
  options: PickerOption[];
  selectedValue: string;
  anchorTop: number;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [draftValue, setDraftValue] = useState(selectedValue || options[0]?.value || "");
  const sheetTop =
    typeof window === "undefined"
      ? DEFAULT_PICKER_TOP
      : Math.max(
          PICKER_VIEWPORT_MARGIN,
          Math.min(
            anchorTop,
            Math.max(
              PICKER_VIEWPORT_MARGIN,
              window.innerHeight - PICKER_SHEET_HEIGHT - PICKER_VIEWPORT_MARGIN
            )
          )
        );

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
    };
  }, []);

  useEffect(() => {
    setDraftValue(selectedValue || options[0]?.value || "");
  }, [options, selectedValue]);

  useEffect(() => {
    const selectedIndex = Math.max(
      0,
      options.findIndex((option) => option.value === draftValue)
    );

    window.requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: selectedIndex * 48,
        behavior: "auto",
      });
    });
  }, [draftValue, options]);

  const handleScroll = () => {
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    const index = Math.max(
      0,
      Math.min(options.length - 1, Math.round(scrollTop / 48))
    );
    const nextValue = options[index]?.value;

    if (nextValue && nextValue !== draftValue) {
      setDraftValue(nextValue);
    }
  };

  const confirmValue = () => {
    onSelect(draftValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-[#171C18]/36"
      />

      <div
        className="absolute inset-x-0 mx-auto flex h-[420px] max-h-[calc(100svh-24px)] max-w-[430px] flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-[#FFFDF8] shadow-[0_24px_70px_rgba(23,28,24,0.22)]"
        style={{ top: sheetTop }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-black/10 px-5 py-4">
          <h3 className="text-lg font-extrabold text-[#171C18]">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#EEF3EA] px-4 py-2 text-sm font-bold text-[#285C42]"
          >
            닫기
          </button>
        </div>

        <div className="relative mx-5 mt-5 h-[240px] overflow-hidden rounded-[26px] bg-[#F8F4EC]">
          <div className="pointer-events-none absolute inset-x-4 top-1/2 z-10 h-12 -translate-y-1/2 rounded-2xl border border-black/10 bg-[#FFFDF8]/95 shadow-[0_8px_20px_rgba(31,42,34,0.07)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-[#F8F4EC] to-[#F8F4EC]/0" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-[#F8F4EC] to-[#F8F4EC]/0" />

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="relative z-20 h-full snap-y snap-mandatory overflow-y-auto overscroll-contain px-4 py-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {options.map((option) => {
              const isSelected = option.value === draftValue;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDraftValue(option.value)}
                  className={`flex h-12 w-full snap-center items-center justify-center rounded-2xl text-[18px] font-extrabold transition ${
                    isSelected
                      ? "text-[#171C18]"
                      : "text-[#A79C8E]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3 px-5 pb-5 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-full bg-[#F8F4EC] text-sm font-extrabold text-[#5E4936]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={confirmValue}
            className="min-h-12 rounded-full bg-[#285C42] text-sm font-extrabold text-[#FFFDF8]"
          >
            선택 완료
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BirthForm() {
  const router = useRouter();

  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [birthDateText, setBirthDateText] = useState("");
  const [birthDateError, setBirthDateError] = useState("");
  const [birthTime, setBirthTime] = useState("0");
  const [gender, setGender] = useState("unknown");
  const [calendarType, setCalendarType] = useState<CalendarType>("solar");
  const [testCaseCode, setTestCaseCode] = useState("");
  const [openPicker, setOpenPicker] = useState<PickerKey>(null);
  const [pickerAnchorTop, setPickerAnchorTop] = useState(DEFAULT_PICKER_TOP);

  const maxDay = getDaysInMonth(year, month);

  const yearOptions = useMemo<PickerOption[]>(
    () =>
      Array.from({ length: currentYear - 1939 }, (_, index) => {
        const value = String(currentYear - index);
        return {
          label: `${value}년`,
          value,
        };
      }),
    [currentYear]
  );

  const monthOptions = useMemo<PickerOption[]>(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const value = String(index + 1).padStart(2, "0");
        return {
          label: `${index + 1}월`,
          value,
        };
      }),
    []
  );

  const dayOptions = useMemo<PickerOption[]>(
    () =>
      Array.from({ length: maxDay }, (_, index) => {
        const value = String(index + 1).padStart(2, "0");
        return {
          label: `${index + 1}일`,
          value,
        };
      }),
    [maxDay]
  );

  const timeOptions: PickerOption[] = [
    { label: "모름", value: "0" },
    { label: "자시 / 23:00~01:00", value: "1" },
    { label: "축시 / 01:00~03:00", value: "2" },
    { label: "인시 / 03:00~05:00", value: "3" },
    { label: "묘시 / 05:00~07:00", value: "4" },
    { label: "진시 / 07:00~09:00", value: "5" },
    { label: "사시 / 09:00~11:00", value: "6" },
    { label: "오시 / 11:00~13:00", value: "7" },
    { label: "미시 / 13:00~15:00", value: "8" },
    { label: "신시 / 15:00~17:00", value: "9" },
    { label: "유시 / 17:00~19:00", value: "10" },
    { label: "술시 / 19:00~21:00", value: "11" },
    { label: "해시 / 21:00~23:00", value: "12" },
  ];

  const selectedTimeLabel =
    timeOptions.find((option) => option.value === birthTime)?.label || "모름";

  const openPickerAt = (
    picker: Exclude<PickerKey, null>,
    event: MouseEvent<HTMLButtonElement>
  ) => {
    setPickerAnchorTop(event.currentTarget.getBoundingClientRect().top);
    setOpenPicker(picker);
  };

  const syncBirthDateText = (
    nextYear: string,
    nextMonth: string,
    nextDay: string
  ) => {
    setBirthDateText(formatBirthDate(nextYear, nextMonth, nextDay));
    setBirthDateError("");
  };

  const updateYear = (value: string) => {
    setYear(value);

    const nextDay = day && Number(day) > getDaysInMonth(value, month) ? "" : day;
    setDay(nextDay);
    syncBirthDateText(value, month, nextDay);
  };

  const updateMonth = (value: string) => {
    setMonth(value);

    const nextDay = day && Number(day) > getDaysInMonth(year, value) ? "" : day;
    setDay(nextDay);
    syncBirthDateText(year, value, nextDay);
  };

  const updateDay = (value: string) => {
    setDay(value);
    syncBirthDateText(year, month, value);
  };

  const updateBirthDateText = (value: string) => {
    setBirthDateText(value);
    setBirthDateError("");

    const parsed = parseBirthDateInput(value, currentYear);
    if (!parsed) return;

    setYear(parsed.year);
    setMonth(parsed.month);
    setDay(parsed.day);
    setBirthDateText(parsed.normalized);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedText = birthDateText.trim()
      ? parseBirthDateInput(birthDateText, currentYear)
      : null;

    if (birthDateText.trim() && !parsedText) {
      setBirthDateError("생년월일을 1990-03-15 또는 19900315 형식으로 입력해주세요.");
      return;
    }

    const submitYear = parsedText?.year ?? year;
    const submitMonth = parsedText?.month ?? month;
    const submitDay = parsedText?.day ?? day;

    if (!submitYear || !submitMonth || !submitDay) {
      alert("생년월일을 모두 선택해주세요.");
      return;
    }

    const birthDate = formatBirthDate(submitYear, submitMonth, submitDay);

    const params = new URLSearchParams({
      birthDate,
      birthTime,
      calendarType,
      gender,
    });
    const normalizedTestCaseCode = testCaseCode.trim();

    if (normalizedTestCaseCode) {
      params.set("testCaseCode", normalizedTestCaseCode);
    }

    router.push(`/result?${params.toString()}`);
  };

  const pickerConfig =
    openPicker === "year"
      ? {
          title: "태어난 년도 선택",
          options: yearOptions,
          selectedValue: year,
          onSelect: updateYear,
        }
      : openPicker === "month"
      ? {
          title: "태어난 월 선택",
          options: monthOptions,
          selectedValue: month,
          onSelect: updateMonth,
        }
      : openPicker === "day"
      ? {
          title: "태어난 일 선택",
          options: dayOptions,
          selectedValue: day,
          onSelect: updateDay,
        }
      : openPicker === "time"
      ? {
          title: "태어난 시간 선택",
          options: timeOptions,
          selectedValue: birthTime,
          onSelect: setBirthTime,
        }
      : null;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-[24px] bg-[#FFFDF8]">
          <p className="mb-4 text-[13px] font-extrabold text-[#285C42]">
            태어난 날
          </p>
          <label className="mb-2 block text-sm font-bold text-[#5E4936]">
            생년월일
          </label>

          <input
            type="text"
            inputMode="numeric"
            value={birthDateText}
            onChange={(event) => updateBirthDateText(event.target.value)}
            onBlur={() => {
              if (!birthDateText.trim()) return;

              const parsed = parseBirthDateInput(birthDateText, currentYear);
              if (!parsed) {
                setBirthDateError(
                  "생년월일을 1990-03-15 또는 19900315 형식으로 입력해주세요."
                );
                return;
              }

              updateBirthDateText(parsed.normalized);
            }}
            placeholder="예: 1990-03-15 / 19900315"
            aria-invalid={birthDateError ? "true" : "false"}
            className="mb-2 w-full rounded-[18px] border border-black/10 bg-[#F8F4EC] px-4 py-4 text-base font-extrabold text-[#171C18] outline-none transition placeholder:text-[#9C9185] focus:border-[#285C42]"
          />

          {birthDateError && (
            <p className="mb-2 text-xs font-semibold leading-5 text-[#9f2d2d]">
              {birthDateError}
            </p>
          )}

          <div className="grid grid-cols-3 gap-2">
            <PickerButton
              label={`${year}년`}
              value={year}
              placeholder="년도"
              onClick={(event) => openPickerAt("year", event)}
            />

            <PickerButton
              label={`${Number(month)}월`}
              value={month}
              placeholder="월"
              onClick={(event) => openPickerAt("month", event)}
            />

            <PickerButton
              label={`${Number(day)}일`}
              value={day}
              placeholder="일"
              onClick={(event) => openPickerAt("day", event)}
            />
          </div>
        </div>

        <div className="rounded-[24px] bg-[#F8F4EC] p-4">
          <label className="mb-2 block text-sm font-bold text-[#5E4936]">
            날짜 기준
          </label>

          <div className="grid grid-cols-2 gap-2 rounded-[18px] bg-[#FFFDF8] p-1">
            {[
              { label: "양력", value: "solar" },
              { label: "음력", value: "lunar" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCalendarType(item.value as CalendarType)}
                className={`rounded-xl px-3 py-3 text-sm font-black transition ${
                  calendarType === item.value
                    ? "bg-[#285C42] text-[#FFFDF8]"
                    : "text-[#7D7469]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className="mt-2 text-xs leading-5 text-[#7D7469]">
            음력은 윤달을 제외한 일반 음력 날짜 기준으로 변환합니다.
          </p>
        </div>

        <div className="rounded-[24px] bg-[#FFFDF8]">
          <p className="mb-4 text-[13px] font-extrabold text-[#285C42]">
            태어난 시간
          </p>
          <label className="mb-2 block text-sm font-bold text-[#5E4936]">
            태어난 시간
          </label>

          <PickerButton
            label={selectedTimeLabel}
            value={birthTime}
            placeholder="태어난 시간 선택"
            onClick={(event) => openPickerAt("time", event)}
          />
        </div>

        <div className="rounded-[24px] bg-[#FFFDF8]">
          <p className="mb-4 text-[13px] font-extrabold text-[#285C42]">
            결과 보정 정보
          </p>
          <label className="mb-2 block text-sm font-bold text-[#5E4936]">
            성별
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "선택 안 함", value: "unknown" },
              { label: "남성", value: "male" },
              { label: "여성", value: "female" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setGender(item.value)}
                className={`rounded-2xl px-3 py-4 text-sm font-bold transition ${
                  gender === item.value
                    ? "bg-[#285C42] text-[#FFFDF8]"
                    : "bg-[#F8F4EC] text-[#7D7469]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] bg-[#FFFDF8]">
          <label className="mb-2 block text-sm font-bold text-[#5E4936]">
            테스트 코드
          </label>
          <input
            type="text"
            value={testCaseCode}
            onChange={(event) => setTestCaseCode(event.target.value)}
            placeholder="선택 입력"
            className="w-full rounded-[18px] border border-black/10 bg-[#F8F4EC] px-4 py-4 text-base font-extrabold text-[#171C18] outline-none transition placeholder:text-[#9C9185] focus:border-[#285C42]"
          />
        </div>

        <button type="submit" className={`${uiTokens.button} mt-6`}>
          내 유형 확인하기
        </button>

        <p className="text-center text-xs font-medium leading-5 text-[#7D7469]">
          내가 솔직한 피드백이 필요합니다!
        </p>
      </form>

      {pickerConfig && (
        <PickerSheet
          title={pickerConfig.title}
          options={pickerConfig.options}
          selectedValue={pickerConfig.selectedValue}
          anchorTop={pickerAnchorTop}
          onSelect={pickerConfig.onSelect}
          onClose={() => setOpenPicker(null)}
        />
      )}
    </>
  );
}
