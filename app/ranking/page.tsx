"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type RankingItem = {
  rank: number;
  id: string;
  name: string;
  grade: number;
  classNo: number;
  points: number;
};

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRanking() {
      try {
        const response = await fetch("/api/ranking", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "랭킹 조회 실패");
        }

        setRanking(data.ranking ?? []);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "포인트 랭킹을 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadRanking();
  }, []);

  const medal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-700 to-slate-50 px-4 py-8">
      <div className="mx-auto max-w-lg">
        <section className="rounded-[32px] bg-white/10 p-7 text-white backdrop-blur">
          <p className="text-sm font-black tracking-[0.18em] text-blue-100">
            WONTONG ON RANKING
          </p>
          <h1 className="mt-3 text-4xl font-black">포인트 TOP 10</h1>
          <p className="mt-3 text-sm leading-6 text-blue-100">
            운동화·교복 캠페인에 적극적으로 참여한 학생들의 포인트
            순위예요. 개인정보 보호를 위해 이름 일부만 표시됩니다.
          </p>
        </section>

        {message && (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {message}
          </p>
        )}

        <section className="mt-5 overflow-hidden rounded-3xl bg-white shadow-xl">
          {loading ? (
            <p className="p-8 text-center text-slate-500">
              랭킹을 불러오는 중이에요.
            </p>
          ) : ranking.length === 0 ? (
            <p className="p-8 text-center text-slate-500">
              아직 랭킹에 표시할 학생이 없습니다.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {ranking.map((student) => (
                <div
                  key={student.id}
                  className={`flex items-center gap-4 px-5 py-5 ${
                    student.rank <= 3 ? "bg-amber-50/60" : ""
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl font-black">
                    {medal(student.rank)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-black text-slate-900">
                      {student.name}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-400">
                      {student.grade}학년 {student.classNo}반
                    </p>
                  </div>

                  <p className="text-xl font-black text-blue-700">
                    {student.points.toLocaleString()}P
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <Link
          href="/point"
          className="mt-5 block rounded-2xl bg-white px-4 py-3 text-center font-black text-blue-700 shadow-sm"
        >
          내 포인트 확인하기
        </Link>

        <Link
          href="/"
          className="mt-3 block text-center text-sm font-bold text-white"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
