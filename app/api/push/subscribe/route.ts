import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type PushSubscriptionBody = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          message: "Supabase 환경변수가 설정되지 않았습니다.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as PushSubscriptionBody;

    const endpoint = body.endpoint;
    const p256dh = body.keys?.p256dh;
    const auth = body.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        {
          message: "올바른 푸시 구독 정보가 아닙니다.",
        },
        { status: 400 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          endpoint,
          p256dh,
          auth,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "endpoint",
        },
      );

    if (error) {
      console.error("푸시 구독 저장 오류:", error);

      return NextResponse.json(
        {
          message: `알림 구독 저장에 실패했습니다: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "알림 구독이 저장되었습니다.",
    });
  } catch (error) {
    console.error("푸시 구독 API 오류:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "알림 설정 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}