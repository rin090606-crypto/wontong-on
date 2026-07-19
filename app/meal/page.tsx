"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Meal = {
  date: string;
  mealType: string;
  menu: string[];
  calories: string;
};

type MealType = "조식" | "중식" | "석식";

const MEAL_TYPES: MealType[] = ["조식", "중식", "석식"];

const MEAL_META: Record<MealType, { icon: string; title: string }> = {
  조식: { icon: "🌅", title: "조식" },
  중식: { icon: "🍱", title: "중식" },
  석식: { icon: "🌙", title: "석식" },
};

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const distance = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + distance);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function toCompactDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function formatRangeDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

export default function MealPage() {
  const today = useMemo(() => new Date(), []);
  const initialWeek = useMemo(() => startOfWeek(today), [today]);
  const [weekStart, setWeekStart] = useState(initialWeek);
  const [selectedType, setSelectedType] = useState<MealType>("중식");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const weekDays = useMemo(
    () => Array.from({ length: 5 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  useEffect(() => {
    const loadMeals = async () => {
      setLoading(true);
      setError("");

      try {
        const from = toCompactDate(weekDays[0]);
        const to = toCompactDate(weekDays[weekDays.length - 1]);
        const response = await fetch(`/api/meals?from=${from}&to=${to}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? "급식 정보를 불러오지 못했습니다.");
        }

        setMeals(data.meals ?? []);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "급식 정보를 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadMeals();
  }, [weekDays]);

  const isCurrentWeek =
    toCompactDate(weekStart) === toCompactDate(initialWeek);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-28 pt-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm font-bold text-blue-600">
            ← 홈으로
          </Link>
          <h1 className="mt-3 text-2xl font-black text-gray-900">주간 급식</h1>
          <p className="mt-1 text-sm text-gray-500">
            원통고등학교 조식·중식·석식 정보예요.
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-3xl">
          🍽️
        </div>
      </header>

      <section className="mt-6 rounded-3xl bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setWeekStart((current) => addDays(current, -7))}
            className="rounded-xl px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100"
          >
            ← 이전
          </button>

          <div className="text-center">
            <p className="text-sm font-black text-gray-900">
              {formatRangeDate(weekDays[0])} ~ {formatRangeDate(weekDays[4])}
            </p>
            {isCurrentWeek ? (
              <p className="mt-0.5 text-xs font-bold text-blue-600">이번 주</p>
            ) : (
              <button
                type="button"
                onClick={() => setWeekStart(initialWeek)}
                className="mt-0.5 text-xs font-bold text-blue-600"
              >
                이번 주로 돌아가기
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setWeekStart((current) => addDays(current, 7))}
            className="rounded-xl px-3 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100"
          >
            다음 →
          </button>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-gray-200 p-1">
        {MEAL_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={`rounded-xl px-2 py-3 text-sm font-bold transition ${
              selectedType === type
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            <span className="mr-1">{MEAL_META[type].icon}</span>
            {MEAL_META[type].title}
          </button>
        ))}
      </section>

      {loading ? (
        <div className="mt-5 space-y-4">
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className="h-44 animate-pulse rounded-3xl bg-white"
            />
          ))}
        </div>
      ) : error ? (
        <section className="mt-5 rounded-3xl bg-red-50 p-6 text-sm text-red-600">
          <p className="font-black">급식을 불러오지 못했어요.</p>
          <p className="mt-2">{error}</p>
        </section>
      ) : (
        <section className="mt-5 space-y-4">
          {weekDays.map((day) => {
            const date = toCompactDate(day);
            const meal = meals.find(
              (item) =>
                item.date === date && item.mealType.includes(selectedType),
            );
            const isToday = date === toCompactDate(today);

            return (
              <article
                key={date}
                className={`rounded-3xl bg-white p-6 shadow-sm ${
                  isToday ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-gray-900">
                      {formatDay(day)}
                    </h2>
                    {isToday ? (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-600">
                        오늘
                      </span>
                    ) : null}
                  </div>

                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                    {MEAL_META[selectedType].icon} {selectedType}
                  </span>
                </div>

                {meal ? (
                  <>
                    <ul className="mt-5 space-y-2.5">
                      {meal.menu.map((item, index) => (
                        <li
                          key={`${item}-${index}`}
                          className="flex items-start gap-3 text-sm font-medium text-gray-700"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="text-xs font-medium text-gray-500">
                        총 열량
                      </span>
                      <span className="text-sm font-black text-gray-900">
                        {meal.calories || "정보 없음"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="mt-5 rounded-2xl bg-gray-50 p-5 text-center">
                    <p className="text-2xl">🍽️</p>
                    <p className="mt-2 text-sm font-bold text-gray-600">
                      등록된 {selectedType} 급식이 없어요.
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}