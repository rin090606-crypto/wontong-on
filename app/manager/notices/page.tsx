"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Notice = {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
};

export default function ManagerNoticesPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("학생회");
  const [sendPush, setSendPush] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [message, setMessage] = useState("");

  async function loadNotices() {
    try {
      const response = await fetch("/api/admin/notices", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "공지 목록을 불러오지 못했습니다.");
        return;
      }

      setNotices(data.notices ?? []);
    } catch {
      setMessage("공지 목록을 불러오는 중 오류가 발생했습니다.");
    }
  }

  useEffect(() => {
    void loadNotices();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage("제목과 내용을 모두 입력해 주세요.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          sendPush,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "공지 등록에 실패했습니다.");
        return;
      }

      setMessage(
        sendPush
          ? `공지 등록 완료 · 알림 ${data.push?.sent ?? 0}건 발송`
          : "공지 등록 완료",
      );

      setTitle("");
      setContent("");

      await loadNotices();
    } catch {
      setMessage("공지 등록 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(notice: Notice) {
    const confirmed = window.confirm(
      `"${notice.title}" 공지를 정말 삭제할까요?\n삭제한 공지는 복구할 수 없습니다.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(notice.id);
    setMessage("");

    try {
      const response = await fetch("/api/admin/notices", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noticeId: notice.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message ?? "공지 삭제에 실패했습니다.");
        return;
      }

      setNotices((current) =>
        current.filter((item) => item.id !== notice.id),
      );

      setMessage("공지를 삭제했습니다.");
    } catch {
      setMessage("공지 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-extrabold tracking-[0.14em] text-blue-600">
              ADMIN
            </p>

            <h1 className="mt-1 text-3xl font-black text-slate-900">
              공지 관리
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-600">
              학생들에게 전달할 공지를 등록하고 알림을 발송합니다.
            </p>
          </div>

          <Link
            href="/manager"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
          >
            ← 관리자 홈
          </Link>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl ring-1 ring-blue-100">
                ✍️
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  새 공지 작성
                </h2>

                <p className="mt-1 text-xs font-medium text-slate-600">
                  등록 즉시 학생 공지 목록에 표시됩니다.
                </p>
              </div>
            </div>

            <label className="mt-6 block text-sm font-extrabold text-slate-700">
              분류
            </label>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            >
              <option>학생회</option>
              <option>학교</option>
              <option>행사</option>
              <option>학사</option>
              <option>기타</option>
            </select>

            <label className="mt-4 block text-sm font-extrabold text-slate-700">
              제목
            </label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={80}
              placeholder="공지 제목을 입력하세요."
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />

            <label className="mt-4 block text-sm font-extrabold text-slate-700">
              내용
            </label>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              placeholder="학생들에게 전달할 내용을 입력하세요."
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 leading-7 text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
            />

            <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-extrabold text-blue-800">
              <input
                type="checkbox"
                checked={sendPush}
                onChange={(event) => setSendPush(event.target.checked)}
                className="h-5 w-5 accent-blue-600"
              />

              등록과 동시에 푸시 알림 보내기
            </label>

            {message && (
              <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-5 w-full rounded-2xl bg-blue-600 py-4 font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "등록 중..." : "공지 등록"}
            </button>
          </form>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold tracking-[0.14em] text-blue-600">
                  RECENT
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  최근 공지
                </h2>
              </div>

              <button
                type="button"
                onClick={() => void loadNotices()}
                className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                새로고침
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {notices.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-600">
                  등록된 공지가 없습니다.
                </div>
              ) : (
                notices.map((notice) => (
                  <article
                    key={notice.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-blue-700">
                        {notice.category}
                      </span>

                      <span className="text-xs font-medium text-slate-600">
                        {new Date(notice.created_at).toLocaleDateString(
                          "ko-KR",
                        )}
                      </span>
                    </div>

                    <Link
                      href={`/notice/${notice.id}`}
                      className="mt-3 block"
                    >
                      <h3 className="font-extrabold text-slate-900">
                        {notice.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-700">
                        {notice.content}
                      </p>
                    </Link>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => void handleDelete(notice)}
                        disabled={deletingId === notice.id}
                        className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === notice.id
                          ? "삭제 중..."
                          : "🗑️ 삭제"}
                      </button>
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