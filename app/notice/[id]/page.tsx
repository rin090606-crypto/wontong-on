"use client";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
type Notice = { title: string; content: string; category: string; created_at: string };
export default function NoticeDetailPage(){ const { id }=useParams<{id:string}>(); const [notice,setNotice]=useState<Notice|null>(null); useEffect(()=>{ if(id) supabase.from("notices").select("title,content,category,created_at").eq("id",id).single().then(({data})=>setNotice(data));},[id]); return <div className="min-h-screen bg-slate-100"><Header/><main className="mx-auto max-w-3xl px-5 py-7"><Link href="/notice" className="text-sm font-bold text-blue-600">← 공지 목록</Link>{notice ? <article className="mt-5 rounded-3xl bg-white p-6 shadow-sm"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">{notice.category}</span><h1 className="mt-4 text-2xl font-black">{notice.title}</h1><p className="mt-2 text-sm text-slate-400">{new Date(notice.created_at).toLocaleString("ko-KR")}</p><div className="mt-7 whitespace-pre-wrap border-t pt-6 leading-8 text-slate-700">{notice.content}</div></article> : <p className="mt-8 text-slate-500">공지 불러오는 중...</p>}</main></div>}
