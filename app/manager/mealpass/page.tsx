"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Row = {
  id: string;
  request_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  profiles: {
    name: string;
    student_id: string;
    grade: number;
    class_no: number;
    student_number: number;
  } | null;
};

type DisplayStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "expired";

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatRequestDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(year, month - 1, day));
}

function getDisplayStatus(
  row: Row,
  today: string,
): DisplayStatus {
  if (
    row.status === "approved" &&
    row.request_date < today
  ) {
    return "expired";
  }

  return row.status;
}

function getStatusLabel(status: DisplayStatus) {
  if (status === "approved") {
    return "승인";
  }

  if (status === "rejected") {
    return "반려";
  }

  if (status === "expired") {
    return "만료";
  }

  return "대기";
}

function getStatusClass(status: DisplayStatus) {
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "rejected") {
    return "bg-red-100 text-red-700";
  }

  if (status === "expired") {
    return "bg-slate-200 text-slate-600";
  }

  return "bg-amber-100 text-amber-700";
}

export default function ManagerMealPassPage() {
  const today = useMemo(() => localDateString(), []);

  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(
    null,
  );

  async function load() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/mealpass", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? "신청 목록을 불러오지 못했습니다.",
        );
      }

      setRows(data.requests ?? []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "신청 목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function update(
    id: string,
    status: "approved" | "rejected",
  ) {
    try {
      setProcessingId(id);
      setMessage("");

      const response = await fetch("/api/admin/mealpass", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: id,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? "신청을 처리하지 못했습니다.",
        );
      }

      setMessage(
        status === "approved"
          ? "급식실 패스를 승인했습니다."
          : "급식실 패스를 반려했습니다.",
      );

      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "신청을 처리하지 못했습니다.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  const pendingCount = rows.filter(
    (row) => getDisplayStatus(row, today) === "pending",
  ).length;

  const approvedCount = rows.filter(
    (row) => getDisplayStatus(row, today) === "approved",
  ).length;

  const expiredCount = rows.filter(
    (row) => getDisplayStatus(row, today) === "expired",
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/manager"
          className="font-black text-blue-600"
        >
          ← 관리자 홈
        </Link>

        <h1 className="mt-4 text-3xl font-black text-slate-900">
          급식실 패스 신청 관리
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          학생 신청을 확인하고 승인 또는 반려하세요.
          승인된 날짜가 지나면 자동으로 만료 처리됩니다.
        </p>

        <section className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-xs font-black text-amber-700">
              승인 대기
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs font-black text-emerald-700">
              사용 가능
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-200 p-4">
            <p className="text-xs font-black text-slate-600">
              만료
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {expiredCount}
            </p>
          </div>
        </section>

        {message ? (
          <p className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
            {message}
          </p>
        ) : null}

        <section className="mt-6 space-y-3">
          {loading ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              <p className="mt-4 font-bold text-slate-600">
                불러오는 중...
              </p>
            </div>
          ) : rows.length === 0 ? (
            <p className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-sm">
              신청이 없습니다.
            </p>
          ) : (
            rows.map((row) => {
              const displayStatus = getDisplayStatus(row, today);
              const isProcessing = processingId === row.id;

              return (
                <article
                  key={row.id}
                  className={`rounded-3xl border bg-white p-5 shadow-sm ${
                    displayStatus === "expired"
                      ? "border-slate-200 opacity-75"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-black text-slate-900">
                        {row.profiles?.name ?? "학생"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {row.profiles
                          ? `${row.profiles.grade}학년 ${row.profiles.class_no}반 ${row.profiles.student_number}번 · ${row.profiles.student_id}`
                          : "학생 정보 없음"}
                      </p>

                      <p className="mt-3 font-bold text-slate-800">
                        사용 날짜:{" "}
                        {formatRequestDate(row.request_date)}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        사유: {row.reason}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-black ${getStatusClass(
                        displayStatus,
                      )}`}
                    >
                      {getStatusLabel(displayStatus)}
                    </span>
                  </div>

                  {displayStatus === "expired" ? (
                    <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold leading-6 text-slate-600">
                      승인된 사용 날짜가 지나 자동으로 만료된
                      패스입니다.
                    </div>
                  ) : null}

                  {displayStatus === "approved" ? (
                    <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-700">
                      해당 날짜에 학생 급식실 패스 화면이
                      활성화됩니다.
                    </div>
                  ) : null}

                  {displayStatus === "pending" ? (
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          void update(row.id, "approved")
                        }
                        className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 font-black text-white disabled:bg-slate-300"
                      >
                        {isProcessing ? "처리 중..." : "승인"}
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          void update(row.id, "rejected")
                        }
                        className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-black text-slate-700 disabled:opacity-50"
                      >
                        반려
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}