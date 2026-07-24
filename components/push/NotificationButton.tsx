"use client";

import { useEffect, useState } from "react";

type ButtonState = "checking" | "unsupported" | "idle" | "loading" | "enabled";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
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
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setState("unsupported");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const subscription = await registration.pushManager.getSubscription();
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
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error("VAPID 공개키가 설정되지 않았습니다.");
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setMessage("브라우저에서 알림을 허용해야 받을 수 있어요.");
        setState("idle");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }));

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "알림 구독 저장에 실패했습니다.");
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
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">알림 기능을 확인하는 중이에요.</p>
      </section>
    );
  }

  if (state === "unsupported") {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-bold text-amber-900">🔕 알림을 지원하지 않는 브라우저예요</h2>
        <p className="mt-1 text-sm leading-6 text-amber-700">
          Chrome 또는 Edge에서 배포된 원통ON 주소로 접속해 주세요.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-gray-900">🔔 공지 알림</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            새 공지가 등록되면 휴대폰이나 컴퓨터로 알려드려요.
          </p>
        </div>

        <button
          type="button"
          onClick={enableNotifications}
          disabled={state === "loading" || state === "enabled"}
          className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {state === "enabled"
            ? "알림 켜짐"
            : state === "loading"
              ? "설정 중..."
              : "알림 받기"}
        </button>
      </div>

      {message && (
        <p className={`mt-3 text-sm ${state === "enabled" ? "text-emerald-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </section>
  );
}
