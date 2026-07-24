import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error web-push does not include bundled TypeScript declarations
import webpush from "web-push";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  try {
    const { data, error } = await adminClient().from("notices").select("id,title,content,category,created_at").order("created_at", { ascending: false }).limit(20);
    if (error) throw error;
    return NextResponse.json({ notices: data ?? [] });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "공지 조회 실패" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();
    const category = String(body.category ?? "학생회").trim();
    if (!title || !content) return NextResponse.json({ message: "제목과 내용을 입력하세요." }, { status: 400 });

    const supabase = adminClient();
    const { data: notice, error } = await supabase.from("notices").insert({ title, content, category }).select("id,title").single();
    if (error) throw error;

    let sent = 0;
    if (body.sendPush) {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const privateKey = process.env.VAPID_PRIVATE_KEY;
      const subject = process.env.VAPID_SUBJECT;
      if (publicKey && privateKey && subject) {
        webpush.setVapidDetails(subject, publicKey, privateKey);
        const { data: subscriptions } = await supabase.from("push_subscriptions").select("id,endpoint,p256dh,auth");
        for (const sub of subscriptions ?? []) {
          try {
            await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify({ title: "원통ON 새 공지", body: title, url: `/notice/${notice.id}` }));
            sent += 1;
          } catch (pushError: any) {
            if (pushError?.statusCode === 404 || pushError?.statusCode === 410) await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
        }
      }
    }
    return NextResponse.json({ notice, push: { sent } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error instanceof Error ? error.message : "공지 등록 실패" }, { status: 500 });
  }
}
