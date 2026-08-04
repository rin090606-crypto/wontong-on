"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Row = {
  id: string;
  request_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  profiles: { name: string; student_id: string; grade: number; class_no: number; student_number: number } | null;
};

export default function ManagerMealPassPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/mealpass", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) setMessage(data.message ?? "불러오지 못했습니다.");
    else setRows(data.requests ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function update(id: string, status: "approved" | "rejected") {
    const response = await fetch("/api/admin/mealpass", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id, status }),
    });
    const data = await response.json();
    if (!response.ok) setMessage(data.message ?? "처리하지 못했습니다.");
    else { setMessage(status === "approved" ? "승인했습니다." : "반려했습니다."); await load(); }
  }

  return <main className="min-h-screen bg-slate-50 px-4 py-8">
    <div className="mx-auto max-w-5xl">
      <Link href="/manager" className="font-black text-blue-600">← 관리자 홈</Link>
      <h1 className="mt-4 text-3xl font-black text-slate-900">급식실 패스 신청 관리</h1>
      <p className="mt-2 text-sm text-slate-500">학생 신청을 확인하고 승인 또는 반려하세요.</p>
      {message ? <p className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">{message}</p> : null}
      <section className="mt-6 space-y-3">
        {loading ? <p className="rounded-3xl bg-white p-8 text-center">불러오는 중...</p> : rows.length === 0 ? <p className="rounded-3xl bg-white p-8 text-center text-slate-500">신청이 없습니다.</p> : rows.map((row) => <article key={row.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-lg font-black text-slate-900">{row.profiles?.name ?? "학생"}</p>
              <p className="mt-1 text-sm text-slate-500">{row.profiles ? `${row.profiles.grade}학년 ${row.profiles.class_no}반 ${row.profiles.student_number}번 · ${row.profiles.student_id}` : "학생 정보 없음"}</p>
              <p className="mt-3 font-bold text-slate-800">신청일: {row.request_date}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">사유: {row.reason}</p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-black ${row.status === "approved" ? "bg-emerald-100 text-emerald-700" : row.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{row.status === "approved" ? "승인" : row.status === "rejected" ? "반려" : "대기"}</span>
          </div>
          {row.status === "pending" ? <div className="mt-4 flex gap-2"><button onClick={() => void update(row.id, "approved")} className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 font-black text-white">승인</button><button onClick={() => void update(row.id, "rejected")} className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 font-black text-slate-700">반려</button></div> : null}
        </article>)}
      </section>
    </div>
  </main>;
}
