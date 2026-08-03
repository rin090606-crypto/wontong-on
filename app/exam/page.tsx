"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ExamScope = {
  id: string;
  grade: number;
  subject: string;
  scope: string;
  updated_at: string;
};

export default function ExamPage() {
  const [items, setItems] = useState<ExamScope[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExams() {
      const { data } = await supabase
        .from("exam_scopes")
        .select("id, grade, subject, scope, updated_at")
        .order("grade", { ascending: true })
        .order("subject", { ascending: true });

      setItems(data ?? []);
      setLoading(false);
    }

    void loadExams();
  }, []);

  const byGrade = useMemo(() => {
    return {
      1: items.filter((item) => item.grade === 1),
      2: items.filter((item) => item.grade === 2),
      3: items.filter((item) => item.grade === 3),
    };
  }, [items]);

  return (
    <main className="min-h-screen bg-slate-100 pb-24 text-slate-900">
      <div className="rounded-b-[40px] bg-blue-600 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-black text-white">📖 시험범위</h1>
        <p className="mt-2 font-medium text-blue-100">
          학년별 시험범위를 확인하세요.
        </p>
      </div>

      <div className="space-y-6 p-5">
        {[1, 2, 3].map((grade) => {
          const subjects = byGrade[grade as 1 | 2 | 3];

          return (
            <section
              key={grade}
              className="rounded-3xl bg-white p-6 shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black text-blue-700">
                  {grade}학년
                </h2>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-black text-blue-700">
                  {subjects.length}과목
                </span>
              </div>

              {loading ? (
                <div className="mt-5 rounded-2xl bg-slate-100 p-6 text-center">
                  <p className="font-bold text-slate-700">
                    시험범위를 불러오는 중이에요.
                  </p>
                </div>
              ) : subjects.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-4xl">📚</p>
                  <p className="mt-3 font-black text-slate-900">
                    시험범위 준비 중
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                    아직 시험범위가 등록되지 않았습니다.
                    <br />
                    공지되는 즉시 업데이트할게요.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {subjects.map((subject) => (
                    <article
                      key={subject.id}
                      className="rounded-2xl bg-slate-100 p-4"
                    >
                      <h3 className="font-black text-slate-900">
                        {subject.subject}
                      </h3>
                      <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-700">
                        {subject.scope}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 w-full border-t bg-white shadow-lg">
        <div className="grid grid-cols-4 py-3 text-center font-medium text-slate-700">
          <Link href="/">
            🏠
            <br />
            홈
          </Link>
          <Link href="/notice">
            📢
            <br />
            공지
          </Link>
          <Link href="/exam" className="font-black text-blue-600">
            📖
            <br />
            시험
          </Link>
          <Link href="/my">
            👤
            <br />
            마이
          </Link>
        </div>
      </div>
    </main>
  );
}
