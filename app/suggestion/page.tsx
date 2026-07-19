"use client";

import { FormEvent, useState } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

type SuggestionCategory = "시설" | "행사" | "복지" | "학습" | "기타";
type SuggestionStatus = "접수됨" | "검토 중" | "처리 완료";

type CheckedSuggestion = {
  id: string;
  category: SuggestionCategory;
  content: string;
  status: SuggestionStatus;
  answer: string | null;
  created_at: string;
  answered_at: string | null;
};

function createLookupCode() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const code = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  )
    .join("")
    .toUpperCase();

  return `WT-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}-${code.slice(12, 16)}`;
}

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function SuggestionPage() {
  const [category, setCategory] =
    useState<SuggestionCategory>("시설");
  const [content, setContent] = useState("");
  const [lookupCode, setLookupCode] = useState("");
  const [savedCode, setSavedCode] = useState("");
  const [checkedSuggestion, setCheckedSuggestion] =
    useState<CheckedSuggestion | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (content.trim().length < 10) {
      setMessageType("error");
      setMessage("건의 내용을 10자 이상 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const newLookupCode = createLookupCode();
    const { error } = await supabase.from("suggestions").insert({
      category,
      content: content.trim(),
      lookup_code: newLookupCode,
    });

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      setMessageType("error");
      setMessage(`건의 제출에 실패했습니다: ${error.message}`);
      return;
    }

    setContent("");
    setCategory("시설");
    setSavedCode(newLookupCode);
    setLookupCode(newLookupCode);
    setCheckedSuggestion(null);
    setMessageType("success");
    setMessage("익명 건의가 접수되었습니다.");
  }

  async function handleCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCode = lookupCode.trim().toUpperCase();

    if (!normalizedCode) {
      setMessageType("error");
      setMessage("접수번호를 입력해주세요.");
      return;
    }

    setIsChecking(true);
    setMessage("");
    setCheckedSuggestion(null);

    const { data, error } = await supabase.rpc(
      "get_suggestion_by_code",
      { input_code: normalizedCode },
    );

    setIsChecking(false);

    if (error) {
      console.error(error);
      setMessageType("error");
      setMessage("건의 조회 중 오류가 발생했습니다.");
      return;
    }

    const result = (data?.[0] ?? null) as CheckedSuggestion | null;

    if (!result) {
      setMessageType("error");
      setMessage("일치하는 접수번호를 찾지 못했습니다.");
      return;
    }

    setCheckedSuggestion(result);
    setMessageType("success");
    setMessage("건의 처리 현황을 불러왔습니다.");
  }

  async function copyCode() {
    if (!savedCode) return;

    await navigator.clipboard.writeText(savedCode);
    setMessageType("success");
    setMessage("접수번호를 복사했습니다.");
  }

  const statusStyle: Record<SuggestionStatus, string> = {
    "접수됨": "bg-blue-50 text-blue-700",
    "검토 중": "bg-yellow-50 text-yellow-700",
    "처리 완료": "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto w-full max-w-md px-5 pb-28 pt-6">
        <section>
          <p className="text-sm font-bold text-blue-600">원통ON 익명 소통</p>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900">
            익명 건의함
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            이름이나 학번 없이 학생회에 의견을 전달할 수 있어요.
          </p>
        </section>

        <section className="mt-6 rounded-3xl bg-blue-600 p-5 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl">
              💬
            </div>
            <div>
              <h2 className="font-bold">개인정보는 적지 마세요</h2>
              <p className="mt-1 text-xs leading-5 text-blue-100">
                이름, 전화번호, 계정 비밀번호 등 개인정보와 타인을 비방하는
                내용은 입력하지 마세요.
              </p>
            </div>
          </div>
        </section>

        {message && (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3 ${
              messageType === "success"
                ? "border-blue-100 bg-blue-50 text-blue-700"
                : "border-red-100 bg-red-50 text-red-700"
            }`}
          >
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {savedCode && (
          <section className="mt-5 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold text-blue-600">내 접수번호</p>
            <p className="mt-2 break-all font-mono text-lg font-extrabold tracking-wide text-gray-900">
              {savedCode}
            </p>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              답변 확인에 꼭 필요합니다. 이 화면을 캡처하거나 번호를 복사해
              보관해주세요.
            </p>
            <button
              type="button"
              onClick={copyCode}
              className="mt-4 w-full rounded-2xl bg-gray-900 py-3 text-sm font-bold text-white"
            >
              접수번호 복사하기
            </button>
          </section>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-3xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-extrabold text-gray-900">새 건의 작성</h2>

          <div className="mt-5">
            <label htmlFor="suggestion-category" className="text-sm font-bold text-gray-800">
              분류
            </label>
            <select
              id="suggestion-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as SuggestionCategory)
              }
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="시설">시설</option>
              <option value="행사">행사</option>
              <option value="복지">복지</option>
              <option value="학습">학습</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className="mt-5">
            <label htmlFor="suggestion-content" className="text-sm font-bold text-gray-800">
              건의 내용
            </label>
            <textarea
              id="suggestion-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={7}
              maxLength={1000}
              placeholder="학교생활에서 개선되었으면 하는 점을 구체적으로 작성해주세요."
              className="mt-2 w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm leading-6 text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500"
            />
            <p className="mt-2 text-right text-xs text-gray-400">
              {content.length}/1000
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSubmitting ? "접수하는 중..." : "익명으로 제출하기"}
          </button>
        </form>

        <form
          onSubmit={handleCheck}
          className="mt-6 rounded-3xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-extrabold text-gray-900">답변 확인</h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            제출할 때 받은 접수번호를 입력하세요.
          </p>

          <input
            type="text"
            value={lookupCode}
            onChange={(event) => setLookupCode(event.target.value.toUpperCase())}
            placeholder="WT-0000-0000-0000-0000"
            className="mt-4 w-full rounded-2xl border border-gray-200 px-4 py-3 font-mono text-sm uppercase text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={isChecking}
            className="mt-3 w-full rounded-2xl border border-blue-200 bg-blue-50 py-3 text-sm font-bold text-blue-700 disabled:opacity-50"
          >
            {isChecking ? "조회하는 중..." : "처리 현황 조회"}
          </button>
        </form>

        {checkedSuggestion && (
          <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-blue-600">
                  {checkedSuggestion.category}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {formatDate(checkedSuggestion.created_at)}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[checkedSuggestion.status]}`}
              >
                {checkedSuggestion.status}
              </span>
            </div>

            <div className="mt-5 rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-bold text-gray-500">내 건의</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                {checkedSuggestion.content}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-bold text-blue-700">학생회 답변</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                {checkedSuggestion.answer?.trim() ||
                  "아직 등록된 답변이 없습니다. 검토가 끝나면 이곳에 답변이 표시됩니다."}
              </p>
              {checkedSuggestion.answered_at && (
                <p className="mt-3 text-xs text-gray-400">
                  답변일 {formatDate(checkedSuggestion.answered_at)}
                </p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}