import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error web-push 타입 선언이 없음
import webpush from "web-push";
function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL 환경변수가 없습니다.");
  }

  if (!key) {
    throw new Error(
      "SUPABASE_SECRET_KEY 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function GET() {
  try {
    const supabase = adminClient();

    const { data, error } = await supabase
      .from("notices")
      .select("id, title, content, category, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      notices: data ?? [],
    });
  } catch (error) {
    console.error("공지 조회 오류:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "공지 조회에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();
    const category = String(body.category ?? "학생회").trim();
    const sendPush = Boolean(body.sendPush);

    if (!title || !content) {
      return NextResponse.json(
        {
          message: "제목과 내용을 모두 입력하세요.",
        },
        { status: 400 },
      );
    }

    const supabase = adminClient();

    const { data: notice, error: noticeError } = await supabase
      .from("notices")
      .insert({
        title,
        content,
        category,
      })
      .select("id, title, content, category, created_at")
      .single();

    if (noticeError) {
      throw noticeError;
    }

    let sent = 0;

    if (sendPush) {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const privateKey = process.env.VAPID_PRIVATE_KEY;
      const subject = process.env.VAPID_SUBJECT;

      if (publicKey && privateKey && subject) {
        webpush.setVapidDetails(subject, publicKey, privateKey);

        const { data: subscriptions, error: subscriptionError } =
          await supabase
            .from("push_subscriptions")
            .select("id, endpoint, p256dh, auth");

        if (subscriptionError) {
          console.error("푸시 구독 조회 오류:", subscriptionError);
        }

        for (const subscription of subscriptions ?? []) {
          try {
            await webpush.sendNotification(
              {
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: subscription.p256dh,
                  auth: subscription.auth,
                },
              },
              JSON.stringify({
                title: "원통ON 새 공지",
                body: title,
                url: `/notice/${notice.id}`,
              }),
            );

            sent += 1;
          } catch (pushError: unknown) {
            const statusCode =
              typeof pushError === "object" &&
              pushError !== null &&
              "statusCode" in pushError
                ? Number(pushError.statusCode)
                : null;

            if (statusCode === 404 || statusCode === 410) {
              await supabase
                .from("push_subscriptions")
                .delete()
                .eq("id", subscription.id);
            } else {
              console.error("푸시 발송 오류:", pushError);
            }
          }
        }
      }
    }

    return NextResponse.json({
      notice,
      push: {
        sent,
      },
    });
  } catch (error) {
    console.error("공지 등록 오류:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "공지 등록에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}