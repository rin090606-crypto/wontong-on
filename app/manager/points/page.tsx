"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  student_id: string;
  name: string;
  grade: number;
  class_no: number;
  student_number: number;
  approved: boolean;
  points: number;
};

export default function PointManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [actorProfileId, setActorProfileId] = useState<string | null>(null);

  async function loadStudents() {
    const response = await fetch("/api/admin/students", {
      cache: "no-store",
    });
    const data = await response.json();

    if (response.ok) {
      setStudents(
        (data.students ?? []).filter((student: Student) => student.approved),
      );
    }
  }

  useEffect(() => {
    async function start() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("auth_user_id", user.id)
          .single();

        setActorProfileId(profile?.id ?? null);
      }

      await loadStudents();
    }

    void start();
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return students.filter(
      (student) =>
        !keyword ||
        student.name.toLowerCase().includes(keyword) ||
        student.student_id.toLowerCase().includes(keyword),
    );
  }, [students, query]);

  const selected = students.find((student) => student.id === selectedId);

  async function submitPoints(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    const numericAmount = Number(amount);

    if (
      !selectedId ||
      !Number.isInteger(numericAmount) ||
      numericAmount === 0 ||
      !reason.trim()
    ) {
      setMessage("학생, 포인트, 사유를 모두 입력해 주세요.");
      return;
    }

    const response = await fetch("/api/admin/points", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: selectedId,
        amount: numericAmount,
        reason: reason.trim(),
        actorProfileId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "포인트 처리 실패");
      return;
    }

    setMessage(`${data.message} 현재 ${data.balance}P입니다.`);
    setAmount("");
    setReason("");
    await loadStudents();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-blue-600">
              POINT MANAGEMENT
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              학생회 포인트
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              캠페인 포인트를 지급하거나 매점 사용 포인트를 차감하세요.
            </p>
          </div>

          <Link
            href="/manager"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600"
          >
            관리자 홈
          </Link>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="학생 이름 또는 학번 검색"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            />

            <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto">
              {filtered.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => setSelectedId(student.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedId === student.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-900">
                        {student.name}
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-500">
                        {student.grade}-{student.class_no}{" "}
                        {student.student_number}번 · {student.student_id}
                      </p>
                    </div>
                    <span className="text-xl font-black text-blue-700">
                      {student.points}P
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <form
            onSubmit={submitPoints}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-black text-slate-900">
              포인트 처리
            </h2>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              {selected ? (
                <>
                  <p className="font-black text-slate-900">{selected.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    현재 보유 {selected.points}P
                  </p>
                </>
              ) : (
                <p className="text-sm font-bold text-slate-500">
                  왼쪽에서 학생을 선택하세요.
                </p>
              )}
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-black text-slate-700">
                변경 포인트
              </span>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                type="number"
                placeholder="지급 20 / 차감 -50"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-sm font-black text-slate-700">사유</span>
              <input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="운동화 캠페인 또는 학생회 매점"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              />
            </label>

            <button
              type="submit"
              className="mt-5 w-full rounded-2xl bg-blue-600 py-3.5 font-black text-white"
            >
              포인트 적용
            </button>

            {message && (
              <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
