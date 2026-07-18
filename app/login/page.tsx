import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-blue-600 flex items-center justify-center">

      <div className="bg-white rounded-3xl p-8 w-96 shadow-xl">

        <h1 className="text-4xl font-bold text-center text-blue-600">
          원통ON
        </h1>

        <p className="text-center text-gray-500 mt-2">
          학생과 학교를 연결하다.
        </p>

        <input
          className="w-full border rounded-xl p-3 mt-8"
          placeholder="학번"
        />

        <input
          type="password"
          className="w-full border rounded-xl p-3 mt-4"
          placeholder="비밀번호"
        />

        <Link
          href="/"
          className="block bg-blue-600 text-white rounded-xl text-center py-3 mt-6"
        >
          로그인
        </Link>

      </div>

    </main>
  );
}