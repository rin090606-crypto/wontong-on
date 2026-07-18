export default function SuggestionPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-5">

      <h1 className="text-3xl font-bold">
        💬 건의함
      </h1>

      <textarea
        className="w-full h-40 rounded-3xl p-4 mt-6 border"
        placeholder="학생회에 전달하고 싶은 내용을 작성해주세요."
      />

      <button className="bg-blue-600 text-white rounded-2xl px-6 py-3 mt-5">
        제출하기
      </button>

    </main>
  );
}