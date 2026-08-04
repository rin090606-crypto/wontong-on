"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  waiting: number;
  approved: number;
  totalPoints: number;
  unresolvedSuggestions: number;
};

type RecentStudent = {
  id: string;
  student_id: string;
  name: string;
  grade: number;
  class_no: number;
  student_number: number;
  approved: boolean;
  role: "student" | "admin";
  points: number;
};

const menuItems = [
  {
    href: "/manager/mealpass",
    icon: "🍽️",
    title: "급식실 패스",
    description: "신청 승인과 반려 관리",
  },
  {
    href: "/manager/notices",
    icon: "📢",
    title: "공지 관리",
    description: "공지 작성과 푸시 알림",
  },
  {
    href: "/manager/students",
    icon: "👥",
    title: "학생 승인",
    description: "가입 승인·거절과 권한 관리",
  },
  {
    href: "/manager/search",
    icon: "🔎",
    title: "학생 검색",
    description: "이름·학번으로 학생 찾기",
  },
  {
    href: "/manager/points",
    icon: "⭐",
    title: "포인트 관리",
    description: "포인트 지급과 차감",
  },
  {
    href: "/manager/suggestions",
    icon: "💬",
    title: "건의 관리",
    description: "익명 건의 확인과 답변",
  },
  {
    href: "/ranking",
    icon: "🏆",
    title: "포인트 랭킹",
    description: "학생용 TOP 10 화면 확인",
  },
];

export default function ManagerPage() {
  const [stats, setStats] = useState<Stats>({
    waiting: 0,
    approved: 0,
    totalPoints: 0,
    unresolvedSuggestions: 0,
  });
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/admin/dashboard", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "관리자 현황 조회 실패");
        }

        setStats(data.stats);
        setRecentStudents(data.recentStudents ?? []);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "관리자 현황을 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const statCards = [
    {
      label: "가입 승인 대기",
      value: `${stats.waiting}명`,
      href: "/manager/students",
    },
    {
      label: "승인 학생",
      value: `${stats.approved}명`,
      href: "/manager/students",
    },
    {
      label: "총 보유 포인트",
      value: `${stats.totalPoints.toLocaleString()}P`,
      href: "/manager/points",
    },
    {
      label: "미처리 건의",
      value: `${stats.unresolvedSuggestions}건`,
      href: "/manager/suggestions",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-500 p-7 text-white shadow-xl sm:p-9">
          <p className="text-sm font-black tracking-[0.2em] text-blue-100">
            WONTONG ON ADMIN
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            관리자 대시보드
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
            학생 승인, 공지, 건의, 포인트 현황을 한 화면에서 관리하세요.
          </p>
        </section>

        {message && (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {message}
          </p>
        )}

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs font-black text-slate-400">{card.label}</p>
              <p className="mt-2 text-2xl font-black text-slate-900">
                {loading ? "-" : card.value}
              </p>
            </Link>
          ))}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                  {item.icon}
                </span>
                <div>
                  <h2 className="font-black text-slate-900 group-hover:text-blue-700">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                최근 가입 학생
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                최근 등록된 계정 5개입니다.
              </p>
            </div>
            <Link
              href="/manager/search"
              className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-black text-blue-700"
            >
              전체 검색
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {!loading && recentStudents.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                가입한 학생이 없습니다.
              </p>
            ) : (
              recentStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-black text-slate-900">
                      {student.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {student.grade}학년 {student.class_no}반{" "}
                      {student.student_number}번 · {student.student_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-blue-700">
                      {student.points ?? 0}P
                    </p>
                    <p
                      className={`mt-1 text-xs font-bold ${
                        student.approved
                          ? "text-emerald-600"
                          : "text-orange-500"
                      }`}
                    >
                      {student.approved ? "승인 완료" : "승인 대기"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
