import Link from "next/link";
import { FileText, Sparkles, HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 text-slate-800 selection:bg-blue-100">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900 tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>공모코치 AI</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              로그인
            </Link>
            <Link 
              href="/dashboard" 
              className="inline-flex h-9 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-500 transition-all active:scale-95"
            >
              시작하기
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center sm:py-32">
        <div className="container mx-auto max-w-3xl flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            AI 기반 공모사업 파트너
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            당신의 아이디어를<br />
            <span className="text-blue-600">선정 확률이 높은 사업계획</span>으로
          </h1>
          
          <p className="max-w-xl text-lg text-slate-600 leading-relaxed">
            복잡한 공고문 분석부터, 부족한 핵심 정보를 채워주는 대화형 AI 코칭, 
            그리고 완성도 높은 사업계획서 초안 생성까지 단번에 해결하세요.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 font-semibold text-white shadow-lg shadow-blue-500/10 hover:bg-blue-500 hover:shadow-blue-500/20 transition-all active:scale-98"
            >
              무료로 시작하기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-slate-200/60 bg-white py-20 sm:py-28">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              선정으로 향하는 3단계 코칭 프로세스
            </h2>
            <p className="mt-4 text-slate-600">
              더 이상 하얀 빈 문서 앞에서 고민하지 마세요. AI가 질문하고 가이드합니다.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-8 transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">1. 공고문 정밀 분석</h3>
              <p className="text-slate-600 leading-relaxed">
                지원사업 공고문 파일(PDF/DOCX) 혹은 URL을 올리면 사업 목적, 지원 대상, 상세 평가 기준과 예산 조건을 추출하여 핵심 요약을 제공합니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-8 transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">2. 대화형 아이디어 코칭</h3>
              <p className="text-slate-600 leading-relaxed">
                아이디어를 텍스트로 단순 입력하면 AI가 공모 목적에 비추어 누락된 필수 정보가 무엇인지 판단하고 핵심 질문을 통해 상세 설계를 완성시킵니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-8 transition-all hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">3. 사업계획서 초안 빌드</h3>
              <p className="text-slate-600 leading-relaxed">
                공고문 요구 요건과 코칭 과정에서 축적된 사용자의 아이디어를 융합하여 사업 필요성, 추진 계획, 기대 효과 등 완성형 초안을 만들어 냅니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Rules Section */}
      <section className="bg-slate-50/80 py-16">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-semibold text-sm">투명한 AI 가이드라인</span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            * 공모코치 AI는 분석의 객관적 근거와 출처를 명확히 제시하며, 당선을 허위 보장하지 않습니다.<br />
            실제 존재하는 데이터와 사용자 입력에 기반해서만 신뢰할 수 있는 계획서를 생성합니다.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
        <div className="container mx-auto max-w-7xl px-6">
          <p>© {new Date().getFullYear()} 공모코치 AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
