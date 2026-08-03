"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type ExamScope = {
  id: string;
  grade: number;
  subject: string;
  scope: string;
  created_at: string;
  updated_at: string;
};

export default function ManagerExamsPage() {
  const [grade, setGrade] = useState(1);
  const [subject, setSubject] = useState("");
  const [scope, setScope] = useState("");
  const [items, setItems] = useState<ExamScope[]>([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadItems() {
    try {
      const response = await fetch("/api/admin/exams", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "시험범위 조회 실패");
        return;
      }

      setItems(data.exams ?? []);
    } catch {
      setMessage("시험범위를 불러오는 중 오류가 발생했습니다.");
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!subject.trim() || !scope.trim()) {
      setMessage("과목과 시험범위를 모두 입력해 주세요.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade,
          subject: subject.trim(),
          scope: scope.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "시험범위 저장 실패");
        return;
      }

      setMessage(data.message ?? "시험범위를 저장했습니다.");
      setSubject("");
      setScope("");
      await loadItems();
    } catch {
      setMessage("시험범위 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: ExamScope) {
    const confirmed = window.confirm(
      `${item.grade}학년 ${item.subject} 시험범위를 삭제할까요?`,
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setMessage("");

    try {
      const response = await fetch("/api/admin/exams", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: item.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "시험범위 삭제 실패");
        return;
      }

      setItems((current) =>
        current.filter((exam) => exam.id !== item.id),
      );
      setMessage("시험범위를 삭제했습니다.");
    } catch {
      setMessage("시험범위 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  function editItem(item: ExamScope) {
    setGrade(item.grade);
    setSubject(item.subject);
    setScope(item.scope);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-blue-600">
              EXAM MANAGEMENT
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              시험범위 관리
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-600">
              같은 학년·과목을 다시 저장하면 기존 내용이 수정됩니다.
            </p>
          </div>

          <Link
            href="/manager"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700"
          >
            관리자 홈
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-black text-slate-900">
              시험범위 등록
            </h2>

            <label className="mt-5 block text-sm font-black text-slate-700">
              학년
            </label>
            <select
              value={grade}
              onChange={(event) => setGrade(Number(event.target.value))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-900 outline-none focus:border-blue-500"
            >
              <option value={1}>1학년</option>
              <option value={2}>2학년</option>
              <option value={3}>3학년</option>
            </select>

            <label className="mt-4 block text-sm font-black text-slate-700">
              과목
            </label>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="예: 국어"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:border-blue-500"
            />

            <label className="mt-4 block text-sm font-black text-slate-700">
              시험범위
            </label>
            <textarea
              value={scope}
              onChange={(event) => setScope(event.target.value)}
              rows={7}
              placeholder="예: 교과서 18~65쪽, 학습지 1~4"
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 font-medium leading-7 text-slate-900 outline-none placeholder:text-slate-500 focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={saving}
              className="mt-5 w-full rounded-2xl bg-blue-600 py-3.5 font-black text-white disabled:opacity-60"
            >
              {saving ? "저장 중..." : "시험범위 저장"}
            </button>

            {message && (
              <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
                {message}
              </p>
            )}
          </form>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black tracking-[0.14em] text-blue-600">
                  CURRENT
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  등록된 시험범위
                </h2>
              </div>
              <button
                type="button"
                onClick={() => void loadItems()}
                className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-700"
              >
                새로고침
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {items.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
                  <p className="text-3xl">📚</p>
                  <p className="mt-3 font-black text-slate-900">
                    아직 등록된 시험범위가 없습니다.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-700">
                            {item.grade}학년
                          </span>
                          <h3 className="font-black text-slate-900">
                            {item.subject}
                          </h3>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-700">
                          {item.scope}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => editItem(item)}
                          className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 disabled:opacity-60"
                        >
                          {deletingId === item.id ? "삭제 중" : "삭제"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
