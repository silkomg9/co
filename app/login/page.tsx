"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";
// Import firebase if needed
// import { auth } from "@/lib/firebase";
// import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Simulate login for skeletal framework
    try {
      // await signInWithEmailAndPassword(auth, email, password);
      setTimeout(() => {
        router.push("/dashboard");
        setLoading(false);
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "로그인에 실패했습니다.";
      setError(message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      // const provider = new GoogleAuthProvider();
      // await signInWithPopup(auth, provider);
      setTimeout(() => {
        router.push("/dashboard");
        setLoading(false);
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "구글 로그인에 실패했습니다.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/60 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-100/50">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm mb-4">
            <Sparkles className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">공모코치 AI 시작하기</h1>
          <p className="mt-2 text-sm text-slate-500">
            공고 분석과 기획서 작성을 한 번에 관리하세요.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-3.5 text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">이메일 주소</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">비밀번호</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-500 transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "로그인 중..." : "이메일로 계속하기"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-slate-200/80"></div>
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">또는</span>
          <div className="h-px flex-1 bg-slate-200/80"></div>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
          className="flex w-full items-center justify-center gap-2.5 rounded-full border border-slate-200/80 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-98 disabled:opacity-50"
        >
          {/* Custom Google Logo Icon SVG */}
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 1.84 14.94 1 12 1 7.35 1 3.39 3.67 1.41 7.56l3.7 2.87C6.01 7.21 8.76 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.73-4.94 3.73-8.55z"
            />
            <path
              fill="#FBBC05"
              d="M5.11 14.78a7.12 7.12 0 0 1 0-4.56l-3.7-2.87A11.96 11.96 0 0 0 0 12c0 1.77.39 3.44 1.41 4.97l3.7-2.87z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.1.74-2.5 1.18-4.26 1.18-3.24 0-5.99-2.17-6.97-5.11l-3.7 2.87C3.39 20.33 7.35 23 12 23z"
            />
          </svg>
          Google 계정으로 계속하기
        </button>

        <p className="mt-8 text-center text-xs text-slate-500">
          계정이 없으신가요?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            회원가입
          </Link>
        </p>

      </div>
    </div>
  );
}
