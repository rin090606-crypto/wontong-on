import { todayMeal } from "@/data/meal";

export default function MealCard() {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-blue-600">
            오늘의 급식
          </p>

          <h2 className="mt-1 text-lg font-bold text-gray-900">
            {todayMeal.date}
          </h2>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
          🍱
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {todayMeal.menu.map((item) => (
          <span
            key={item}
            className="rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-sm text-gray-500">
          총 열량
        </span>

        <span className="text-sm font-bold text-gray-900">
          {todayMeal.calories}
        </span>
      </div>
    </section>
  );
}