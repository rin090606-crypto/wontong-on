import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
// @ts-expect-error web-push 타입 선언이 없음
import webpush from "web-push";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // 학생 승인 API와 동일하게 service role 키를 우선 사용
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL 환경변수가 없습니다.");
  }

  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 또는 SUPABASE_SECRET_KEY 환경변수가 없습니다.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
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
      throw new Error(`공지 조회 실패: ${error.message}`);
    }

    return NextResponse.json(
      {
        notices: data ?? [],
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("공지 조회 오류:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "공지 조회에 실패했습니다.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
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

    // 1. 공지 먼저 저장
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
      throw new Error(`공지 저장 실패: ${noticeError.message}`);
    }

    // 2. 푸시 알림은 실패해도 공지 등록 자체는 성공하도록 별도 처리
    let sent = 0;
    let pushMessage = "푸시 알림을 보내지 않았습니다.";

    if (sendPush) {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const privateKey = process.env.VAPID_PRIVATE_KEY;
      const subject =
        process.env.VAPID_SUBJECT || "mailto:admin@wontong-on.app";

      if (!publicKey || !privateKey) {
        pushMessage =
          "공지는 등록했지만 VAPID 환경변수가 없어 푸시 알림은 보내지 못했습니다.";
      } else {
        try {
          webpush.setVapidDetails(subject, publicKey, privateKey);

          const { data: subscriptions, error: subscriptionError } =
            await supabase
              .from("push_subscriptions")
              .select("id, endpoint, p256dh, auth");

          if (subscriptionError) {
            pushMessage = `공지는 등록했지만 푸시 구독 조회에 실패했습니다: ${subscriptionError.message}`;
          } else {
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
                    ? Number(
                        (pushError as { statusCode?: number }).statusCode,
                      )
                    : null;

                if (statusCode === 404 || statusCode === 410) {
                  await supabase
                    .from("push_subscriptions")
                    .delete()
                    .eq("id", subscription.id);
                } else {
                  console.error("개별 푸시 발송 오류:", pushError);
                }
              }
            }

            pushMessage = `${sent}명에게 푸시 알림을 보냈습니다.`;
          }
        } catch (pushError) {
          console.error("푸시 알림 처리 오류:", pushError);
          pushMessage =
            "공지는 등록했지만 푸시 알림 처리 중 오류가 발생했습니다.";
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        notice,
        push: {
          sent,
          message: pushMessage,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("공지 등록 오류:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "공지 등록에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const noticeId = String(body.noticeId ?? "").trim();

    if (!noticeId) {
      return NextResponse.json(
        {
          message: "삭제할 공지 정보가 없습니다.",
        },
        { status: 400 },
      );
    }

    const supabase = adminClient();

    const { error } = await supabase
      .from("notices")
      .delete()
      .eq("id", noticeId);

    if (error) {
      throw new Error(`공지 삭제 실패: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "공지를 삭제했습니다.",
    });
  } catch (error) {
    console.error("공지 삭제 오류:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "공지 삭제에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}