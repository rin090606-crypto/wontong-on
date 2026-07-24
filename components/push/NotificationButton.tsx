"use client";

import { useEffect, useState } from "react";

type ButtonState =
  | "checking"
  | "unsupported"
  | "idle"
  | "loading"
  | "enabled";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return output;
}

export default function NotificationButton() {
  const [state, setState] = useState<ButtonState>("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkSubscription() {
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setState("unsupported");
        return;
      }

      try {
        const registration =
          await navigator.serviceWorker.register("/sw.js");

        const subscription =
          await registration.pushManager.getSubscription();

        setState(subscription ? "enabled" : "idle");
      } catch (error) {
        console.error(error);
        setMessage("알림 기능을 준비하지 못했습니다.");
        setState("idle");
      }
    }

    void checkSubscription();
  }, []);

  async function enableNotifications() {
    setState("loading");
    setMessage("");

    try {
      const keyResponse = await fetch("/api/push/public-key", {
        cache: "no-store",
      });

      const keyResult = (await keyResponse.json()) as {
        publicKey?: string;
        message?: string;
      };

      if (!keyResponse.ok || !keyResult.publicKey) {
        throw new Error(
          keyResult.message || "VAPID 공개키를 불러오지 못했습니다.",
        );
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setMessage("브라우저에서 알림을 허용해야 받을 수 있어요.");
        setState("idle");
        return;
      }

      const registration =
        await navigator.serviceWorker.register("/sw.js");

      await navigator.serviceWorker.ready;

      const existing =
        await registration.pushManager.getSubscription();

      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            keyResult.publicKey,
          ) as BufferSource,
        }));

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription.toJSON()),
      });

      const result = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.message || "알림 구독 저장에 실패했습니다.",
        );
      }

      setState("enabled");
      setMessage("이제 새로운 공지 알림을 받을 수 있어요.");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "알림 설정 중 오류가 발생했습니다.",
      );

      setState("idle");
    }
  }

  if (state === "checking") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        알림 기능을 확인하는 중이에요.
      </div>
    );
  }

  if (state === "unsupported") {
    return (
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
        <h2 className="font-bold text-orange-900">
          알림을 지원하지 않는 브라우저예요
        </h2>
        <p className="mt-2 text-sm text-orange-700">
          Chrome 또는 Edge에서 배포된 원통ON 주소로 접속해 주세요.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">
        🔔 공지 알림
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        새 공지가 등록되면 휴대폰이나 컴퓨터로 알려드려요.
      </p>

      <button
        type="button"
        onClick={enableNotifications}
        disabled={state === "enabled" || state === "loading"}
        className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white disabled:bg-slate-300"
      >
        {state === "enabled"
          ? "알림 켜짐"
          : state === "loading"
            ? "설정 중..."
            : "알림 받기"}
      </button>

      {message && (
        <p className="mt-3 text-sm text-slate-600">
          {message}
        </p>
      )}
    </section>
  );
}