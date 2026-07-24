"use client";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

type Notice = { id: string; title: string; category: string; created_at: string };
export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  useEffect(() => { supabase.from("notices").select("id,title,category,created_at").order("created_at", { ascending: false }).then(({ data }) => setNotices(data ?? [])); }, []);
  return <div className="min-h-screen bg-slate-100"><Header/><main className="mx-auto max-w-3xl px-5 py-7"><h1 className="text-3xl font-black text-slate-900">📢 공지사항</h1><div className="mt-6 space-y-3">{notices.map(n => <Link key={n.id} href={`/notice/${n.id}`} className="block rounded-3xl bg-white p-5 shadow-sm"><span className="text-xs font-bold text-blue-600">{n.category}</span><h2 className="mt-2 text-lg font-extrabold">{n.title}</h2><p className="mt-2 text-sm text-slate-400">{new Date(n.created_at).toLocaleDateString("ko-KR")}</p></Link>)}</div></main></div>;
}
