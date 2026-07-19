"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

type SuggestionStatus = "접수됨" | "검토 중" | "처리 완료";

type Suggestion = {
  id: string;
  lookup_code: string;
  category: string;
  content: string;
  status: SuggestionStatus;
  answer: string | null;
  created_at: string;
  answered_at: string | null;
};

const STATUS_OPTIONS: SuggestionStatus[] = [
  "접수됨",
  "검토 중",
  "처리 완료",
];

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

function statusClass(status: SuggestionStatus) {
  if (status === "처리 완료") return "bg-emerald-50 text-emerald-700";
  if (status === "검토 중") return "bg-amber-50 text-amber-700";
  return "bg-blue-50 text-blue-700";
}

export default function ManagerSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadSuggestions = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("suggestions")
      .select(
        "id, lookup_code, category, content, status, answer, created_at, answered_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setErrorMessage(`건의 목록을 불러오지 못했습니다: ${error.message}`);
      setSuggestions([]);
    } else {
      setSuggestions((data ?? []) as Suggestion[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSuggestions();
  }, [loadSuggestions]);

  function updateSuggestion<K extends "status" | "answer">(
    id: string,
    field: K,
    value: Suggestion[K],
  ) {
    setSuggestions((current) =>
      current.map((suggestion) =>
        suggestion.id === id
          ? { ...suggestion, [field]: value }
          : suggestion,
      ),
    );
  }

  async function saveSuggestion(suggestion: Suggestion) {
    setSavingId(suggestion.id);
    setErrorMessage("");

    const trimmedAnswer = suggestion.answer?.trim() ?? "";

    const { error } = await supabase
      .from("suggestions")
      .update({
        status: suggestion.status,
        answer: trimmedAnswer || null,
        answered_at: trimmedAnswer ? new Date().toISOString() : null,
      })
      .eq("id", suggestion.id);

    if (error) {
      console.error(error);
      setErrorMessage(`저장에 실패했습니다: ${error.message}`);
    } else {
      alert("상태와 답변이 저장되었습니다.");
      await loadSuggestions();
    }

    setSavingId(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-blue-600">원통ON 관리자</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
              익명 건의 관리
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              접수된 건의를 확인하고 처리 상태와 답변을 저장할 수 있습니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadSuggestions()}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            새로고침
          </button>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            건의 목록을 불러오는 중입니다.
          </div>
        ) : suggestions.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            접수된 건의가 없습니다.
          </div>
        ) : (
          <div className="space-y-5">
            {suggestions.map((suggestion) => (
              <section
                key={suggestion.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {suggestion.category}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(suggestion.status)}`}
                      >
                        {suggestion.status}
                      </span>
                    </div>

                    <p className="mt-3 break-all font-mono text-sm font-bold text-slate-700">
                      접수번호 {suggestion.lookup_code}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      접수 {formatDate(suggestion.created_at)}
                    </p>
                    {suggestion.answered_at && (
                      <p className="mt-1 text-xs text-slate-400">
                        답변 {formatDate(suggestion.answered_at)}
                      </p>
                    )}
                  </div>

                  <select
                    value={suggestion.status}
                    onChange={(event) =>
                      updateSuggestion(
                        suggestion.id,
                        "status",
                        event.target.value as SuggestionStatus,
                      )
                    }
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">학생 건의</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-800">
                    {suggestion.content}
                  </p>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor={`answer-${suggestion.id}`}
                    className="mb-2 block text-sm font-bold text-slate-800"
                  >
                    학생회 답변
                  </label>
                  <textarea
                    id={`answer-${suggestion.id}`}
                    value={suggestion.answer ?? ""}
                    onChange={(event) =>
                      updateSuggestion(
                        suggestion.id,
                        "answer",
                        event.target.value,
                      )
                    }
                    rows={5}
                    maxLength={1500}
                    placeholder="학생에게 전달할 답변을 입력하세요."
                    className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-2 text-right text-xs text-slate-400">
                    {(suggestion.answer ?? "").length}/1500
                  </p>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    disabled={savingId === suggestion.id}
                    onClick={() => void saveSuggestion(suggestion)}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {savingId === suggestion.id
                      ? "저장 중..."
                      : "상태·답변 저장"}
                  </button>
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}