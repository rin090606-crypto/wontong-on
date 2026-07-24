import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type PushSubscriptionPayload = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    const subscription = (await request.json()) as PushSubscriptionPayload;
    const endpoint = subscription.endpoint?.trim();
    const p256dh = subscription.keys?.p256dh?.trim();
    const auth = subscription.keys?.auth?.trim();

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { message: "올바르지 않은 푸시 구독 정보입니다." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        endpoint,
        p256dh,
        auth,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );

    if (error) {
      console.error("푸시 구독 저장 오류:", error);
      return NextResponse.json(
        { message: `알림 구독 저장에 실패했습니다: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("푸시 구독 API 오류:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "알림 구독 처리 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}
