"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name: string;
  student_id: string;
  grade: number;
  class_no: number;
  student_number: number;
  approved: boolean;
};

type PassRequest = {
  id: string;
  request_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
};

function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(date);
}

export default function MealPassPage() {
  const today = useMemo(() => localDateString(), []);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [request, setRequest] = useState<PassRequest | null>(null);
  const [requestDate, setRequestDate] = useState(today);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  async function loadRequest(profileId: string, date: string) {
    const { data, error } = await supabase
      .from("meal_pass_requests")
      .select("id, request_date, reason, status")
      .eq("profile_id", profileId)
      .eq("request_date", date)
      .maybeSingle();
    if (error) throw error;
    setRequest((data as PassRequest | null) ?? null);
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, student_id, grade, class_no, student_number, approved")
          .eq("auth_user_id", user.id)
          .single();
        if (error) throw error;
        const nextProfile = data as Profile;
        setProfile(nextProfile);
        await loadRequest(nextProfile.id, today);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "학생 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    }
    void loadProfile();
  }, [today]);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    void loadRequest(profile.id, requestDate)
      .catch((error) => setMessage(error instanceof Error ? error.message : "신청 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [profile, requestDate]);

  async function apply() {
    if (!profile || !reason.trim()) {
      setMessage("신청 사유를 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    const { error } = await supabase.from("meal_pass_requests").insert({
      profile_id: profile.id,
      request_date: requestDate,
      reason: reason.trim(),
    });
    if (error) setMessage(error.message);
    else {
      setMessage("급식실 패스를 신청했어요. 관리자 승인을 기다려 주세요.");
      setReason("");
      await loadRequest(profile.id, requestDate);
    }
    setSubmitting(false);
  }

  async function cancelRequest() {
    if (!request) return;
    setSubmitting(true);
    const { error } = await supabase.from("meal_pass_requests").delete().eq("id", request.id).eq("status", "pending");
    if (error) setMessage(error.message);
    else {
      setRequest(null);
      setMessage("신청을 취소했어요.");
    }
    setSubmitting(false);
  }

  const passCode = useMemo(() => {
    const minuteKey = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}${now.getHours()}${now.getMinutes()}`;
    const source = `${profile?.student_id ?? "WONTONG"}-${minuteKey}`;
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
    return String(hash % 10000).padStart(4, "0");
  }, [now, profile?.student_id]);

  const canShowPass = requestDate === today && request?.status === "approved" && profile?.approved;

  return <main className="mx-auto min-h-screen w-full max-w-md bg-slate-50 px-5 pb-28 pt-6">
    <header className="flex items-start justify-between gap-4">
      <div>
        <Link href="/" className="text-sm font-black text-blue-600">← 홈으로</Link>
        <h1 className="mt-3 text-2xl font-black text-slate-900">급식실 패스</h1>
        <p className="mt-1 text-sm leading-6 text-slate-600">필요한 날짜를 신청하고 승인된 패스를 보여주세요.</p>
      </div>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">🍽️</div>
    </header>

    {message ? <p className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold leading-6 text-blue-700">{message}</p> : null}

    {loading ? <section className="mt-8 rounded-[32px] bg-white p-8 text-center shadow-sm"><div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"/><p className="mt-4 font-bold text-slate-600">확인하는 중이에요.</p></section> : !profile ? <section className="mt-8 rounded-[32px] bg-white p-8 text-center shadow-sm"><p className="text-4xl">🔒</p><p className="mt-4 font-black text-slate-900">로그인이 필요해요.</p></section> : canShowPass ? <>
      <section className="relative mt-8 overflow-hidden rounded-[36px] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-2xl shadow-blue-200">
        <div className="relative">
          <div className="flex items-center justify-between"><div><p className="text-xs font-black tracking-[0.22em] text-blue-100">WONTONG ON</p><p className="mt-2 text-lg font-black">원통고등학교 급식실</p></div><span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-black">승인 완료</span></div>
          <div className="mt-8 rounded-3xl bg-white p-6 text-slate-900 shadow-lg">
            <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold text-slate-500">학생</p><h2 className="mt-1 text-3xl font-black">{profile.name}</h2><p className="mt-2 font-bold text-slate-700">{profile.grade}학년 {profile.class_no}반 {profile.student_number}번</p></div><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">👤</div></div>
            <div className="mt-6 border-t border-dashed border-slate-200 pt-5"><p className="text-center text-xs font-black tracking-[0.25em] text-slate-400">PASS CODE</p><p className="mt-1 text-center text-5xl font-black tracking-[0.18em] text-blue-700">{passCode}</p></div>
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-emerald-400/20 px-4 py-3 text-emerald-50"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-300"/><span className="font-black">입장 가능</span></div>
        </div>
      </section>
      <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-black text-slate-900">{formatDate(now)}</p><p className="mt-1 text-xs font-bold text-slate-500">코드는 매분 변경됩니다.</p></div><p className="font-mono text-xl font-black text-blue-700">{formatTime(now)}</p></div></section>
    </> : <section className="mt-8 rounded-[32px] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black text-slate-900">패스 신청</h2>
      <label className="mt-5 block text-sm font-black text-slate-700">사용 날짜<input type="date" min={today} value={requestDate} onChange={(e) => { setRequestDate(e.target.value); setMessage(""); }} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"/></label>
      {request ? <div className={`mt-5 rounded-3xl p-5 ${request.status === "approved" ? "bg-emerald-50" : request.status === "rejected" ? "bg-red-50" : "bg-amber-50"}`}><p className="font-black text-slate-900">{request.status === "approved" ? "승인 완료" : request.status === "rejected" ? "신청 반려" : "승인 대기 중"}</p><p className="mt-2 text-sm leading-6 text-slate-600">사유: {request.reason}</p>{request.status === "pending" ? <button disabled={submitting} onClick={() => void cancelRequest()} className="mt-4 w-full rounded-2xl bg-white px-4 py-3 font-black text-red-600">신청 취소</button> : null}{request.status === "approved" && requestDate !== today ? <p className="mt-3 text-sm font-bold text-emerald-700">해당 날짜가 되면 패스 화면이 열려요.</p> : null}</div> : <><label className="mt-5 block text-sm font-black text-slate-700">신청 사유<textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="예: 학생회 행사 준비로 먼저 식사해야 합니다." className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"/></label><button disabled={submitting || !profile.approved} onClick={() => void apply()} className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-4 font-black text-white disabled:bg-slate-300">{submitting ? "신청 중..." : "급식실 패스 신청"}</button>{!profile.approved ? <p className="mt-3 text-center text-xs font-bold text-red-500">학생 계정 승인 후 신청할 수 있어요.</p> : null}</>}
    </section>}
  </main>;
}
