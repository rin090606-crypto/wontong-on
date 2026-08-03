"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Student = {
  id: string;
  student_id: string;
  name: string;
  grade: number;
  class_no: number;
  student_number: number;
  role: "student" | "admin";
  approved: boolean;
  points: number;
  created_at: string;
};

export default function StudentSearchPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      try {
        const response = await fetch("/api/admin/students", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "학생 목록 조회 실패");
        }

        setStudents(data.students ?? []);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "학생 목록 조회 실패",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadStudents();
  }, []);

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return students;

    return students.filter((student) => {
      const classText = `${student.grade}-${student.class_no}`;
      return (
        student.name.toLowerCase().includes(keyword) ||
        student.student_id.toLowerCase().includes(keyword) ||
        classText.includes(keyword)
      );
    });
  }, [students, query]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-blue-600">
              STUDENT SEARCH
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              학생 검색
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              이름, 학번 또는 학년-반으로 검색하세요.
            </p>
          </div>
          <Link
            href="/manager"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600"
          >
            관리자 홈
          </Link>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
          placeholder="예: 김세린, 2303, 2-3"
          className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        {message && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {message}
          </p>
        )}

        <p className="mt-4 text-sm font-bold text-slate-500">
          {loading ? "불러오는 중..." : `${results.length}명 검색됨`}
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {results.map((student) => (
            <article
              key={student.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">
                      {student.name}
                    </h2>
                    {student.role === "admin" && (
                      <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-black text-violet-700">
                        관리자
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-bold text-slate-600">
                    {student.grade}학년 {student.class_no}반{" "}
                    {student.student_number}번
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    학번 {student.student_id}
                  </p>
                </div>

                <p className="text-xl font-black text-blue-700">
                  {student.points ?? 0}P
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-black ${
                    student.approved
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {student.approved ? "승인 완료" : "승인 대기"}
                </span>

                <Link
                  href="/manager/points"
                  className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700"
                >
                  포인트 관리
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
