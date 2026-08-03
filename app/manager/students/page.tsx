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

export default function StudentApprovalPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"waiting" | "approved">("waiting");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadStudents() {
    setLoading(true);

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

  useEffect(() => {
    void loadStudents();
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return students.filter((student) => {
      const matchesTab =
        tab === "waiting" ? !student.approved : student.approved;

      const matchesQuery =
        !keyword ||
        student.name.toLowerCase().includes(keyword) ||
        student.student_id.toLowerCase().includes(keyword);

      return matchesTab && matchesQuery;
    });
  }, [students, query, tab]);

  async function updateStudent(
    profileId: string,
    action: "approve" | "make_admin" | "make_student",
  ) {
    setMessage("");

    const response = await fetch("/api/admin/students", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, action }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "처리하지 못했습니다.");
      return;
    }

    setMessage(
      action === "approve"
        ? "학생을 승인했습니다."
        : action === "make_admin"
          ? "관리자 권한을 부여했습니다."
          : "학생 권한으로 변경했습니다.",
    );

    await loadStudents();
  }

  async function rejectStudent(profileId: string, name: string) {
    if (!window.confirm(`${name} 학생의 가입 신청을 거절할까요?`)) return;

    const response = await fetch("/api/admin/students", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "거절하지 못했습니다.");
      return;
    }

    setMessage("가입 신청을 거절했습니다.");
    await loadStudents();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black tracking-[0.18em] text-blue-600">
              STUDENT MANAGEMENT
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              학생 승인
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              가입 신청을 확인하고 학생 계정을 승인하세요.
            </p>
          </div>

          <Link
            href="/manager"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-600"
          >
            관리자 홈
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-2xl bg-slate-200 p-1">
          <button
            type="button"
            onClick={() => setTab("waiting")}
            className={`rounded-xl py-3 font-black ${
              tab === "waiting"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            승인 대기
          </button>
          <button
            type="button"
            onClick={() => setTab("approved")}
            className={`rounded-xl py-3 font-black ${
              tab === "approved"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500"
            }`}
          >
            승인 완료
          </button>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="이름 또는 학번 검색"
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
        />

        {message && (
          <p className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
            {message}
          </p>
        )}

        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="rounded-3xl bg-white p-6 text-center text-slate-500">
              학생 목록을 불러오는 중이에요.
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 text-center text-slate-500">
              표시할 학생이 없습니다.
            </div>
          ) : (
            filtered.map((student) => (
              <article
                key={student.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-900">
                        {student.name}
                      </h2>
                      {student.role === "admin" && (
                        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-700">
                          관리자
                        </span>
                      )}
                    </div>

                    <p className="mt-1 font-bold text-slate-600">
                      {student.grade}학년 {student.class_no}반{" "}
                      {student.student_number}번 · {student.student_id}
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      현재 포인트 {student.points}P
                    </p>
                  </div>

                  {!student.approved ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateStudent(student.id, "approve")}
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white"
                      >
                        승인
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          rejectStudent(student.id, student.name)
                        }
                        className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-black text-red-600"
                      >
                        거절
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        updateStudent(
                          student.id,
                          student.role === "admin"
                            ? "make_student"
                            : "make_admin",
                        )
                      }
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black text-slate-600"
                    >
                      {student.role === "admin"
                        ? "학생 권한으로"
                        : "관리자 권한 부여"}
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
