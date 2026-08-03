"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "signup";

function makeEmail(studentId: string) {
  return `${studentId.trim()}@student.wontongon.kr`;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("1");
  const [classNo, setClassNo] = useState("1");
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const cleanId = studentId.trim();

      if (!cleanId || !password) {
        throw new Error("학번과 비밀번호를 입력해 주세요.");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: makeEmail(cleanId),
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("로그인 정보를 확인하지 못했습니다.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name, role, approved")
        .eq("auth_user_id", data.user.id)
        .single();

      if (profileError) {
        await supabase.auth.signOut();
        throw new Error("학생 정보를 불러오지 못했습니다.");
      }

      if (!profile.approved) {
        await supabase.auth.signOut();
        throw new Error("아직 학생회 승인이 완료되지 않았습니다.");
      }

      router.replace(profile.role === "admin" ? "/manager" : "/");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "로그인 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const cleanName = name.trim();
      const cleanNumber = number.trim();
      const cleanStudentId = `${grade}${classNo}${cleanNumber.padStart(2, "0")}`;

      if (!cleanName || !cleanNumber || !password) {
        throw new Error("이름, 학년·반·번호, 비밀번호를 모두 입력해 주세요.");
      }

      if (!/^\d{1,2}$/.test(cleanNumber)) {
        throw new Error("번호는 숫자로 입력해 주세요.");
      }

      if (password.length < 6) {
        throw new Error("비밀번호는 6자 이상으로 설정해 주세요.");
      }

      const { data, error } = await supabase.auth.signUp({
        email: makeEmail(cleanStudentId),
        password,
        options: {
          data: {
            student_id: cleanStudentId,
            name: cleanName,
            grade: Number(grade),
            class_no: Number(classNo),
            student_number: Number(cleanNumber),
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("회원가입 정보를 저장하지 못했습니다.");

      setStudentId(cleanStudentId);
      setMode("login");
      setPassword("");
      setMessage(
        `가입 신청 완료! 학번은 ${cleanStudentId}입니다. 학생회 승인 후 로그인할 수 있어요.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "회원가입 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-500 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <section className="w-full rounded-[32px] bg-white p-6 shadow-2xl sm:p-8">
          <div className="text-center">
            <p className="text-sm font-black tracking-[0.2em] text-blue-500">
              WONTONG ON
            </p>
            <h1 className="mt-2 text-4xl font-black text-blue-700">원통ON</h1>
            <p className="mt-2 text-sm text-slate-500">
              학생과 학교를 연결하다
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              className={`rounded-xl py-2.5 text-sm font-black ${
                mode === "login"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setMessage("");
              }}
              className={`rounded-xl py-2.5 text-sm font-black ${
                mode === "signup"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              회원가입
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">학번</span>
                <input
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  inputMode="numeric"
                  placeholder="예: 23015"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">비밀번호</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비밀번호"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 py-3.5 font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:bg-slate-300"
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">이름</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="이름"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <div className="grid grid-cols-3 gap-2">
                <label>
                  <span className="text-sm font-bold text-slate-700">학년</span>
                  <select
                    value={grade}
                    onChange={(event) => setGrade(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-3"
                  >
                    <option value="1">1학년</option>
                    <option value="2">2학년</option>
                    <option value="3">3학년</option>
                  </select>
                </label>

                <label>
                  <span className="text-sm font-bold text-slate-700">반</span>
                  <select
                    value={classNo}
                    onChange={(event) => setClassNo(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-3"
                  >
                    {[1, 2, 3, 4, 5, 6].map((value) => (
                      <option key={value} value={value}>
                        {value}반
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="text-sm font-bold text-slate-700">번호</span>
                  <input
                    value={number}
                    onChange={(event) => setNumber(event.target.value)}
                    inputMode="numeric"
                    placeholder="15"
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-3"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">비밀번호</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="6자 이상"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-blue-600 py-3.5 font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:bg-slate-300"
              >
                {loading ? "가입 신청 중..." : "가입 신청"}
              </button>
            </form>
          )}

          {message && (
            <p className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold leading-6 text-blue-800">
              {message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
