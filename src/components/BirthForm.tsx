"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function getDaysInMonth(year: string, month: string) {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

export default function BirthForm() {
  const router = useRouter();

  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: currentYear - 1939 },
    (_, index) => String(currentYear - index)
  );

  const months = Array.from({ length: 12 }, (_, index) =>
    String(index + 1).padStart(2, "0")
  );

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [birthTime, setBirthTime] = useState("0");
  const [gender, setGender] = useState("unknown");

  const maxDay = getDaysInMonth(year, month);

  const days = Array.from({ length: maxDay }, (_, index) =>
    String(index + 1).padStart(2, "0")
  );

  useEffect(() => {
    if (day && Number(day) > maxDay) {
      setDay("");
    }
  }, [day, maxDay]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!year || !month || !day) {
      alert("생년월일을 모두 선택해주세요.");
      return;
    }

    const birthDate = `${year}-${month}-${day}`;

    const params = new URLSearchParams({
      birthDate,
      birthTime,
      gender,
    });

    router.push(`/result?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-bold text-gray-900">
          생년월일
        </label>

        <div className="grid grid-cols-3 gap-2">
          <select
            required
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-4 text-base font-semibold text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white"
          >
            <option value="">년도</option>
            {years.map((item) => (
              <option key={item} value={item}>
                {item}년
              </option>
            ))}
          </select>

          <select
            required
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-4 text-base font-semibold text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white"
          >
            <option value="">월</option>
            {months.map((item) => (
              <option key={item} value={item}>
                {Number(item)}월
              </option>
            ))}
          </select>

          <select
            required
            value={day}
            onChange={(event) => setDay(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-4 text-base font-semibold text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white"
          >
            <option value="">일</option>
            {days.map((item) => (
              <option key={item} value={item}>
                {Number(item)}일
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-gray-900">
          태어난 시간
        </label>

        <select
          value={birthTime}
          onChange={(event) => setBirthTime(event.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-base font-semibold text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white"
        >
          <option value="0">모름</option>
          <option value="1">자시 / 23:00~01:00</option>
          <option value="2">축시 / 01:00~03:00</option>
          <option value="3">인시 / 03:00~05:00</option>
          <option value="4">묘시 / 05:00~07:00</option>
          <option value="5">진시 / 07:00~09:00</option>
          <option value="6">사시 / 09:00~11:00</option>
          <option value="7">오시 / 11:00~13:00</option>
          <option value="8">미시 / 13:00~15:00</option>
          <option value="9">신시 / 15:00~17:00</option>
          <option value="10">유시 / 17:00~19:00</option>
          <option value="11">술시 / 19:00~21:00</option>
          <option value="12">해시 / 21:00~23:00</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-gray-900">
          성별
        </label>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setGender("unknown")}
            className={`rounded-2xl px-3 py-4 text-sm font-bold transition ${
              gender === "unknown"
                ? "bg-gray-950 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            선택 안 함
          </button>

          <button
            type="button"
            onClick={() => setGender("male")}
            className={`rounded-2xl px-3 py-4 text-sm font-bold transition ${
              gender === "male"
                ? "bg-gray-950 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            남성
          </button>

          <button
            type="button"
            onClick={() => setGender("female")}
            className={`rounded-2xl px-3 py-4 text-sm font-bold transition ${
              gender === "female"
                ? "bg-gray-950 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            여성
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-gray-950 px-5 py-4 text-base font-black text-white shadow-lg transition active:scale-[0.98]"
      >
        내 재물 포텐셜 확인하기
      </button>

      <p className="text-center text-xs leading-5 text-gray-400">
        입력한 정보는 현재 MVP 단계에서 저장하지 않습니다.
      </p>
    </form>
  );
}