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

const MEAL_META: Record<MealType, { icon: string; label: string }> = {
  조식: { icon: "🌅", label: "아침" },
  중식: { icon: "🍱", label: "점심" },
  석식: { icon: "🌙", label: "저녁" },
};

function toCompactDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function formatToday(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

export default function MealCard() {
  const today = useMemo(() => new Date(), []);
  const date = useMemo(() => toCompactDate(today), [today]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedType, setSelectedType] = useState<MealType>("중식");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMeals = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/meals?from=${date}&to=${date}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? "급식 정보를 불러오지 못했습니다.");
        }

        const nextMeals: Meal[] = data.meals ?? [];
        setMeals(nextMeals);

        if (!nextMeals.some((meal) => meal.mealType.includes("중식"))) {
          const firstType = MEAL_TYPES.find((type) =>
            nextMeals.some((meal) => meal.mealType.includes(type)),
          );
          if (firstType) setSelectedType(firstType);
        }
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
  }, [date]);

  const selectedMeal = meals.find((meal) =>
    meal.mealType.includes(selectedType),
  );

  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-blue-600">오늘의 급식</p>
            <h2 className="mt-1 text-lg font-black text-gray-900">
              {formatToday(today)}
            </h2>
          </div>

          <Link
            href="/meal"
            className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-600"
          >
            주간 보기 →
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-gray-100 p-1">
          {MEAL_TYPES.map((type) => {
            const available = meals.some((meal) => meal.mealType.includes(type));
            const active = selectedType === type;

            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`rounded-xl px-2 py-2.5 text-xs font-bold transition ${
                  active
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500"
                } ${!available && !loading ? "opacity-50" : ""}`}
              >
                <span className="mr-1">{MEAL_META[type].icon}</span>
                {MEAL_META[type].label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="mt-5 space-y-3">
            <div className="h-5 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-gray-100" />
            <div className="h-5 w-3/5 animate-pulse rounded bg-gray-100" />
          </div>
        ) : error ? (
          <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        ) : selectedMeal ? (
          <div className="mt-5">
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {selectedMeal.menu.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex items-start gap-2 text-sm font-medium text-gray-700"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-gray-50 p-5 text-center">
            <p className="text-2xl">🍽️</p>
            <p className="mt-2 text-sm font-bold text-gray-700">
              등록된 {MEAL_META[selectedType].label} 급식이 없어요.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              주말·방학·급식 미운영일일 수 있어요.
            </p>
          </div>
        )}
      </div>

      {selectedMeal && !loading && !error ? (
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
          <span className="text-xs font-medium text-gray-500">총 열량</span>
          <span className="text-sm font-black text-gray-900">
            {selectedMeal.calories || "정보 없음"}
          </span>
        </div>
      ) : null}
    </section>
  );
}