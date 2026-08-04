"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Lesson = {
  id: string;
  date: string;
  grade: string;
  className: string;
  roomName: string;
  period: number;
  subject: string;
  department: string;
  courseType: string;
  orderName: string;
};

type SavedChoices = Record<string, string>;

const DAYS = ["월", "화", "수", "목", "금"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const STORAGE_SETTINGS_KEY = "wontong-timetable-settings";
const STORAGE_CHOICES_KEY = "wontong-timetable-choices";

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function toCompactDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
}

function formatShortDate(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function weekdayKey(date: string) {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(4, 6)) - 1;
  const day = Number(date.slice(6, 8));
  const weekday = new Date(year, month, day).getDay();
  return weekday === 0 ? 7 : weekday;
}

function slotKey(date: string, period: number, grade: string) {
  return `${grade}-weekday-${weekdayKey(date)}-period-${period}`;
}

function lessonChoiceId(lesson: Lesson) {
  return [
    lesson.subject,
    lesson.className,
    lesson.roomName,
    lesson.department,
    lesson.orderName,
  ].join("|");
}

function lessonLabel(lesson: Lesson) {
  const place = lesson.roomName || lesson.className;
  return place ? `${lesson.subject} · ${place}` : lesson.subject;
}

export default function TimetablePage() {
  const today = useMemo(() => new Date(), []);
  const initialWeek = useMemo(() => startOfWeek(today), [today]);
  const [weekStart, setWeekStart] = useState(initialWeek);
  const [grade, setGrade] = useState("2");
  const [homeClass, setHomeClass] = useState("1");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [choices, setChoices] = useState<SavedChoices>({});
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const weekDays = useMemo(
    () => Array.from({ length: 5 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  useEffect(() => {
    try {
      const rawSettings = localStorage.getItem(STORAGE_SETTINGS_KEY);
      const rawChoices = localStorage.getItem(STORAGE_CHOICES_KEY);

      if (rawSettings) {
        const settings = JSON.parse(rawSettings) as {
          grade?: string;
          homeClass?: string;
        };
        if (settings.grade) setGrade(settings.grade);
        if (settings.homeClass) setHomeClass(settings.homeClass);
      }

      if (rawChoices) {
        setChoices(JSON.parse(rawChoices) as SavedChoices);
      }
    } catch {
      localStorage.removeItem(STORAGE_SETTINGS_KEY);
      localStorage.removeItem(STORAGE_CHOICES_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      STORAGE_SETTINGS_KEY,
      JSON.stringify({ grade, homeClass }),
    );
  }, [grade, homeClass, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_CHOICES_KEY, JSON.stringify(choices));
  }, [choices, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    const loadTimetable = async () => {
      setLoading(true);
      setError("");

      try {
        const from = toCompactDate(weekDays[0]);
        const to = toCompactDate(weekDays[4]);
        const response = await fetch(
          `/api/timetable?from=${from}&to=${to}&grade=${grade}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? "시간표를 불러오지 못했습니다.");
        }

        setLessons(data.lessons ?? []);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "시간표를 불러오지 못했습니다.",
        );
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };

    void loadTimetable();
  }, [grade, hydrated, weekDays]);

  function candidatesFor(date: string, period: number) {
    const all = lessons.filter(
      (lesson) => lesson.date === date && lesson.period === period,
    );

    const homeClassCandidates = all.filter(
      (lesson) => lesson.className === homeClass,
    );

    const unique = (items: Lesson[]) =>
      Array.from(
        new Map(
          items.map((item) => [
            `${item.subject}-${item.className}-${item.roomName}`,
            item,
          ]),
        ).values(),
      );

    return {
      all: unique(all),
      recommended: unique(homeClassCandidates),
    };
  }

  function selectedLesson(date: string, period: number) {
    const key = slotKey(date, period, grade);
    const { all, recommended } = candidatesFor(date, period);
    const savedId = choices[key];
    const saved = all.find((lesson) => lessonChoiceId(lesson) === savedId);

    if (saved) return saved;
    if (recommended.length === 1) return recommended[0];
    if (all.length === 1) return all[0];
    return null;
  }

  function chooseLesson(date: string, period: number, lesson: Lesson) {
    const key = slotKey(date, period, grade);
    setChoices((current) => ({ ...current, [key]: lessonChoiceId(lesson) }));
    setEditingSlot(null);
    setSaveMessage(`${lesson.subject} 수업을 저장했어요.`);
    window.setTimeout(() => setSaveMessage(""), 1800);
  }

  function clearChoice(date: string, period: number) {
    const key = slotKey(date, period, grade);
    setChoices((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setSaveMessage("저장한 선택을 지웠어요.");
    window.setTimeout(() => setSaveMessage(""), 1800);
  }

  const isCurrentWeek =
    toCompactDate(weekStart) === toCompactDate(initialWeek);

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-5 pb-28 pt-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm font-bold text-blue-600">
            ← 홈으로
          </Link>
          <h1 className="mt-3 text-2xl font-black text-gray-900">내 시간표</h1>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            나이스 시간표에서 내 수업만 선택해 저장해요.
          </p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
          📚
        </div>
      </header>

      {saveMessage ? (
        <div className="fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-xl">
          ✓ {saveMessage}
        </div>
      ) : null}

      <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-bold text-gray-700">
            학년
            <select
              value={grade}
              onChange={(event) => {
                setGrade(event.target.value);
                setEditingSlot(null);
              }}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 outline-none focus:border-blue-500"
            >
              {["1", "2", "3"].map((value) => (
                <option key={value} value={value}>
                  {value}학년
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-bold text-gray-700">
            반
            <select
              value={homeClass}
              onChange={(event) => {
                setHomeClass(event.target.value);
                setEditingSlot(null);
              }}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 outline-none focus:border-blue-500"
            >
              {Array.from({ length: 10 }, (_, index) => String(index + 1)).map(
                (value) => (
                  <option key={value} value={value}>
                    {value}반
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-xs leading-5 text-blue-700">
          선택과목 시간에 후보가 여러 개 나오면 수업을 눌러 내 과목으로
          저장하면 돼요. 한 번 선택한 수업은 같은 요일·교시에 다음 주에도 자동으로 적용됩니다.
        </div>
      </section>

      <section className="mt-4 rounded-3xl bg-white p-3 shadow-sm">
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
              {formatShortDate(weekDays[0])} ~ {formatShortDate(weekDays[4])}
            </p>
            {!isCurrentWeek ? (
              <button
                type="button"
                onClick={() => setWeekStart(initialWeek)}
                className="mt-1 text-xs font-bold text-blue-600"
              >
                이번 주로 돌아가기
              </button>
            ) : (
              <p className="mt-1 text-xs font-bold text-blue-600">이번 주</p>
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

      {loading ? (
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-3xl bg-white"
            />
          ))}
        </div>
      ) : error ? (
        <section className="mt-5 rounded-3xl bg-red-50 p-6 text-sm text-red-600">
          <p className="font-black">시간표를 불러오지 못했어요.</p>
          <p className="mt-2 leading-6">{error}</p>
        </section>
      ) : lessons.length === 0 ? (
        <section className="mt-5 rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-3xl">🗓️</p>
          <p className="mt-3 font-black text-gray-800">
            이 기간의 시간표가 없어요.
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            방학이거나 나이스에 아직 시간표가 등록되지 않았을 수 있어요.
          </p>
        </section>
      ) : (
        <section className="mt-5 space-y-4">
          {weekDays.map((day, dayIndex) => {
            const date = toCompactDate(day);
            const isToday = date === toCompactDate(today);

            return (
              <article
                key={date}
                className={`rounded-3xl bg-white p-5 shadow-sm ${
                  isToday ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-gray-900">
                      {DAYS[dayIndex]}요일
                    </h2>
                    {isToday ? (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-600">
                        오늘
                      </span>
                    ) : null}
                  </div>
                  <span className="text-sm font-bold text-gray-400">
                    {formatShortDate(day)}
                  </span>
                </div>

                <div className="mt-4 space-y-2.5">
                  {PERIODS.map((period) => {
                    const key = slotKey(date, period, grade);
                    const selected = selectedLesson(date, period);
                    const { all, recommended } = candidatesFor(date, period);
                    const isEditing = editingSlot === key;
                    const candidatePool = all.length > 0 ? all : recommended;

                    return (
                      <div key={period}>
                        <button
                          type="button"
                          onClick={() =>
                            candidatePool.length > 1
                              ? setEditingSlot(isEditing ? null : key)
                              : undefined
                          }
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                            selected
                              ? "border-blue-100 bg-blue-50"
                              : candidatePool.length > 0
                                ? "border-amber-200 bg-amber-50"
                                : "border-gray-100 bg-gray-50"
                          }`}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-gray-500 shadow-sm">
                            {period}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-sm font-black ${
                                selected ? "text-gray-900" : "text-gray-500"
                              }`}
                            >
                              {selected
                                ? selected.subject
                                : candidatePool.length > 1
                                  ? "내 수업을 선택하세요"
                                  : "수업 정보 없음"}
                            </p>
                            {selected ? (
                              <p className="mt-0.5 truncate text-xs text-gray-500">
                                {[selected.className && `${selected.className}반`, selected.roomName]
                                  .filter(Boolean)
                                  .join(" · ") || "교실 정보 없음"}
                              </p>
                            ) : candidatePool.length > 1 ? (
                              <p className="mt-0.5 text-xs font-bold text-amber-600">
                                후보 {candidatePool.length}개
                              </p>
                            ) : null}
                          </div>

                          {candidatePool.length > 1 ? (
                            <span className="text-xs font-black text-blue-600">
                              {isEditing ? "닫기" : "변경"}
                            </span>
                          ) : null}
                        </button>

                        {isEditing ? (
                          <div className="mt-2 space-y-2 rounded-2xl border border-blue-100 bg-white p-3">
                            <p className="px-1 text-xs font-bold text-gray-500">
                              {period}교시 내 수업을 선택하세요.
                            </p>
                            {candidatePool.map((lesson) => (
                              <button
                                key={lesson.id}
                                type="button"
                                onClick={() => chooseLesson(date, period, lesson)}
                                className="w-full rounded-xl border border-gray-100 px-3 py-3 text-left hover:border-blue-300 hover:bg-blue-50"
                              >
                                <p className="text-sm font-black text-gray-900">
                                  {lesson.subject}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {lessonLabel(lesson)}
                                </p>
                              </button>
                            ))}
                            {choices[key] ? (
                              <button
                                type="button"
                                onClick={() => clearChoice(date, period)}
                                className="w-full rounded-xl px-3 py-2 text-xs font-bold text-red-500"
                              >
                                저장한 선택 지우기
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}