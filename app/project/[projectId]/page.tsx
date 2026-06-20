"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { 
  Sparkles, FileText, ArrowRight, ArrowLeft, Send, CheckCircle, 
  Loader2, AlertCircle, Copy, Check, LayoutGrid, Award, DollarSign, Target, HelpCircle 
} from "lucide-react";

interface ProjectDetails {
  id: string;
  title: string;
  status: "notice_analyzed" | "coaching" | "completed" | "initial";
  progress: number;
  noticeFile?: string;
  initialIdea?: string;
  coachingQuestions?: string[];
  answers?: string[];
}

interface AnalysisData {
  summary: string;
  target: string;
  evaluationCriteria: string;
  budget: string;
  keywords: string[];
  evidence: string;
}

interface PlanData {
  businessName: string;
  necessity: string;
  purpose: string;
  schedule: string;
  indicator: string;
  benefit: string;
}

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { projectId } = use(params);

  // States
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [plan, setPlan] = useState<PlanData | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Inputs
  const [noticeText, setNoticeText] = useState("");
  const [ideaText, setIdeaText] = useState("");
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);

  // Active step (1: Notice, 2: Idea & Coaching, 3: Plan Editor)
  const [activeStep, setActiveStep] = useState(1);

  // File Upload states and handlers
  const [fileUploading, setFileUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("PDF 파일만 업로드할 수 있습니다.");
      return;
    }

    setFileUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("PDF 텍스트 파싱에 실패했습니다.");
      const data = await res.json();
      
      if (data.text) {
        setNoticeText(data.text);
      } else {
        throw new Error("추출된 텍스트가 없습니다.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "파일 파싱 중 오류가 발생했습니다.";
      setError(message);
    } finally {
      setFileUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Fetch project details on load
  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        setError("");
        
        // 1. Fetch project meta
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("프로젝트 목록을 불러오지 못했습니다.");
        const data = await res.json();
        const found = data.projects?.find((p: ProjectDetails) => p.id === projectId);
        
        if (!found) {
          // Fallback mockup local state if project is recently created and db is empty
          setProject({
            id: projectId,
            title: "신규 공모 지원 프로젝트",
            status: "initial",
            progress: 10,
          });
          setLoading(false);
          return;
        }

        setProject(found);

        // Adjust step based on database status
        if (found.status === "completed") {
          setActiveStep(3);
          // fetch generated plan mock
          setPlan({
            businessName: `[초안] ${found.initialIdea || "상용화"} 프로젝트`,
            necessity: "현재 시장은 핵심 문제에 직면해 있습니다. 본 과제는 이의 해결을 최우선 목표로 삼고 있습니다.",
            purpose: "지원 기간 내 솔루션 프로토타입 제작 및 현장 실증 완료",
            schedule: "1. 환경 설계 | 2. 프로토타입 설계 및 개발 | 3. 성능 평가 및 개선 | 4. 사업화 연계 및 론칭",
            indicator: "솔루션 검증 완성도 95% 이상 달성, 고객 피드백 만족도 4.0/5.0 이상",
            benefit: "본 사업 추진 시 25%의 비용 절감 및 향후 시장 경쟁력 제고 기대",
          });
        } else if (found.status === "coaching") {
          setActiveStep(2);
          if (found.answers) setAnswers(found.answers);
        } else if (found.status === "notice_analyzed") {
          setActiveStep(1.5); // Showing analysis screen
          setAnalysis({
            summary: "청년 창업 및 기술 혁신을 발굴하여 시제품 상용화를 가속화하기 위한 사업입니다.",
            target: "창업 3년 이내의 신생 벤처 및 기술 개발 능력을 보유한 개인/법인",
            evaluationCriteria: "기술의 참신성 및 완성도(45%), 시장 성장성(35%), 예산 구성 적정성(20%)",
            budget: "프로젝트당 최대 5,000만원 한도 (정부지원 80%, 자부담 20%)",
            keywords: ["창업지원", "시제품제작", "혁신기술"],
            evidence: "공고문 본문 제3조(지원대상) 및 제5조(평가기준) 참조",
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "프로젝트 로드 중 오류가 발생했습니다.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  // Actions
  const handleAnalyzeNotice = async () => {
    if (!noticeText.trim()) return;
    setActionLoading(true);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, noticeText }),
      });
      if (!res.ok) throw new Error("공고문 분석에 실패했습니다.");
      const data = await res.json();
      
      setAnalysis(data);
      setProject(prev => prev ? { ...prev, status: "notice_analyzed", progress: 30 } : null);
      setActiveStep(1.5); // Move to analysis view
    } catch (err) {
      const message = err instanceof Error ? err.message : "분석 과정 중 오류가 발생했습니다.";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartCoaching = async () => {
    if (!ideaText.trim()) return;
    setActionLoading(true);
    setError("");

    try {
      const res = await fetch("/api/coaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, idea: ideaText }),
      });
      if (!res.ok) throw new Error("코칭 질문 생성에 실패했습니다.");
      const data = await res.json();
      
      setProject(prev => prev ? { 
        ...prev, 
        status: "coaching", 
        progress: 60,
        initialIdea: ideaText, 
        coachingQuestions: data.questions 
      } : null);
      setActiveStep(2); // Go to coaching input step
    } catch (err) {
      const message = err instanceof Error ? err.message : "코칭 질문을 받아오지 못했습니다.";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    setActionLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, answers }),
      });
      if (!res.ok) throw new Error("사업계획서 초안 생성에 실패했습니다.");
      const data = await res.json();
      
      setPlan(data);
      setProject(prev => prev ? { ...prev, status: "completed", progress: 100 } : null);
      setActiveStep(3); // Go to plan editor step
    } catch (err) {
      const message = err instanceof Error ? err.message : "사업계획서 생성 중 오류가 발생했습니다.";
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!plan) return;
    const text = `
[사업명]
${plan.businessName}

[1. 사업의 필요성]
${plan.necessity}

[2. 사업의 목적]
${plan.purpose}

[3. 추진 일정 및 계획]
${plan.schedule}

[4. 핵심 성과 지표]
${plan.indicator}

[5. 기대 효과]
${plan.benefit}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-500">프로젝트 정보를 구성하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-bold text-slate-900 line-clamp-1">{project?.title}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            진행률 {project?.progress || 0}%
          </div>
        </div>
      </header>

      {/* Stepper Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 sm:text-sm">
            <button 
              onClick={() => setActiveStep(1)} 
              className={`flex items-center gap-1.5 transition-colors ${activeStep >= 1 ? "text-blue-600 font-bold" : ""}`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${activeStep >= 1 ? "bg-blue-600 text-white" : "bg-slate-100"}`}>1</span>
              공고 분석
            </button>
            <div className="h-px flex-1 bg-slate-200 mx-4"></div>
            <button 
              disabled={!analysis}
              onClick={() => setActiveStep(2)} 
              className={`flex items-center gap-1.5 transition-colors disabled:opacity-50 ${activeStep === 2 ? "text-blue-600 font-bold" : activeStep > 2 ? "text-slate-700" : ""}`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${activeStep >= 2 ? "bg-blue-600 text-white" : "bg-slate-100"}`}>2</span>
              AI 코칭
            </button>
            <div className="h-px flex-1 bg-slate-200 mx-4"></div>
            <button 
              disabled={!plan}
              onClick={() => setActiveStep(3)} 
              className={`flex items-center gap-1.5 transition-colors disabled:opacity-50 ${activeStep === 3 ? "text-blue-600 font-bold" : ""}`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${activeStep >= 3 ? "bg-blue-600 text-white" : "bg-slate-100"}`}>3</span>
              계획서 에디터
            </button>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <main className="container mx-auto flex-1 max-w-5xl px-6 py-10">
        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Upload Notice & Analyze */}
        {activeStep === 1 && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">공고문 정보 입력하기</h2>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
              분석할 공고문 PDF 파일을 업로드하거나 텍스트를 직접 입력해 주세요. AI가 사업 목표, 지원 조건, 핵심 평가 항목 등을 발췌하여 요약해 드립니다.
            </p>

            {/* PDF Upload Box */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("pdf-file-input")?.click()}
              className={`mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                dragActive ? "border-blue-500 bg-blue-50/30" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/50"
              }`}
            >
              <input 
                id="pdf-file-input"
                type="file" 
                accept=".pdf" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              {fileUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <p className="text-sm font-semibold text-blue-600">PDF 파일 분석 및 텍스트 추출 중...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-1">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800">이곳에 PDF 공고문 파일을 끌어다 놓거나 클릭하세요</p>
                  <p className="text-xs">지원 형식: PDF (최대 10MB)</p>
                </div>
              )}
            </div>

            {/* OR Divider */}
            <div className="my-6 flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">또는 직접 입력</span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <div className="mt-2">
              <textarea
                rows={12}
                placeholder="공고 내용을 이곳에 붙여넣으세요. (예: 사업 목적, 대상 자격, 예산 한도, 배점 기준 등)"
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/30 p-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              ></textarea>
            </div>

            <button
              onClick={handleAnalyzeNotice}
              disabled={actionLoading || !noticeText.trim()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-500 transition-all active:scale-98 disabled:opacity-50"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  공고 분석서 생성 중...
                </>
              ) : (
                <>
                  공고 분석 시작하기
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 1.5: Notice Analysis View */}
        {activeStep === 1.5 && analysis && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Analysis Result Panels */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-3 mb-4">
                  <LayoutGrid className="h-5 w-5 text-blue-600" />
                  <h3>공고 정밀 분석 결과</h3>
                </div>

                <div className="space-y-6">
                  {/* Summary */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-1">
                      <Target className="h-3.5 w-3.5 text-blue-500" /> 사업 요약
                    </span>
                    <p className="text-sm leading-relaxed text-slate-700 bg-slate-50 rounded-xl p-4">{analysis.summary}</p>
                  </div>

                  {/* Target */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-1">
                      <Award className="h-3.5 w-3.5 text-amber-500" /> 지원 대상
                    </span>
                    <p className="text-sm leading-relaxed text-slate-700 bg-slate-50 rounded-xl p-4">{analysis.target}</p>
                  </div>

                  {/* Evaluation Criteria */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-1">
                      <FileText className="h-3.5 w-3.5 text-emerald-500" /> 평가 지표 및 배점
                    </span>
                    <p className="text-sm leading-relaxed text-slate-700 bg-slate-50 rounded-xl p-4">{analysis.evaluationCriteria}</p>
                  </div>

                  {/* Budget */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-1">
                      <DollarSign className="h-3.5 w-3.5 text-indigo-500" /> 지원 예산
                    </span>
                    <p className="text-sm leading-relaxed text-slate-700 bg-slate-50 rounded-xl p-4">{analysis.budget}</p>
                  </div>
                </div>
              </div>

              {/* Input Idea Section */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-1">아이디어 입력</h3>
                <p className="text-xs text-slate-500 mb-4">공고 분석 정보에 매칭하여 발전시킬 핵심 비즈니스 아이디어를 작성하세요.</p>
                <textarea
                  rows={4}
                  placeholder="예: AI 기술을 접목하여 공고문을 자동 분석하고 대화형 코칭을 제공하여 맞춤형 사업계획서를 손쉽게 작성하도록 돕는 모바일 SaaS 플랫폼"
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 p-4 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                ></textarea>
                <button
                  onClick={handleStartCoaching}
                  disabled={actionLoading || !ideaText.trim()}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-500 transition-all active:scale-98 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI 코칭 진단 질문 파싱 중...
                    </>
                  ) : (
                    <>
                      아이디어 코칭 질문 받기
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sidebar Evidence & Keywords */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">핵심 키워드</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((kw, idx) => (
                    <span key={idx} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">분석 근거</h4>
                <p className="text-xs leading-relaxed text-slate-500">{analysis.evidence}</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: AI Coaching Interactive Q&A */}
        {activeStep === 2 && project && project.coachingQuestions && (
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-blue-600">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-bold text-slate-900">AI 맞춤형 진단 코칭</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                공고문 요구 조건에 대비하여 사용자의 초기 아이디어에서 다소 구체화가 더 필요한 부분을 질문으로 수집합니다.<br />
                제시된 질문에 답하시면 가장 완성도 높은 사업계획서 초안이 빌드됩니다.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm space-y-6">
              {project.coachingQuestions.map((question, index) => (
                <div key={index} className="space-y-2">
                  <label className="flex items-start gap-1.5 text-sm font-bold text-slate-800">
                    <HelpCircle className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                    <span>{question}</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="질문에 응답하여 내용을 구체화하십시오."
                    value={answers[index] || ""}
                    onChange={(e) => {
                      const next = [...answers];
                      next[index] = e.target.value;
                      setAnswers(next);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/30 p-3.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  ></textarea>
                </div>
              ))}

              <button
                onClick={handleGeneratePlan}
                disabled={actionLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-blue-500 transition-all active:scale-98"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    사업계획서 작성 및 조율 중...
                  </>
                ) : (
                  <>
                    사업계획서 초안 완성하기
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Plan Editor */}
        {activeStep === 3 && plan && (
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Top Bar Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle className="h-3 w-3" />
                  초안 생성 완료
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">완성된 사업계획서 초안</h2>
              </div>
              <button
                onClick={copyToClipboard}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-all active:scale-98"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600">복사 완료</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-400" />
                    계획서 텍스트 복사
                  </>
                )}
              </button>
            </div>

            {/* Plan Display Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-md space-y-8">
              {/* Business Name */}
              <div className="border-b border-slate-100 pb-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">최종 사업명</span>
                <h3 className="text-xl font-bold text-slate-900">{plan.businessName}</h3>
              </div>

              {/* Detail Items */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50/50 p-5 border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">1. 사업의 필요성</h4>
                  <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">{plan.necessity}</p>
                </div>
                <div className="rounded-xl bg-slate-50/50 p-5 border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">2. 사업의 목적</h4>
                  <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">{plan.purpose}</p>
                </div>
                <div className="rounded-xl bg-slate-50/50 p-5 border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">3. 추진 계획 및 일정</h4>
                  <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">{plan.schedule}</p>
                </div>
                <div className="rounded-xl bg-slate-50/50 p-5 border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">4. 핵심 성과 지표</h4>
                  <p className="text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">{plan.indicator}</p>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50/30 p-6 border border-blue-100/50">
                <h4 className="text-sm font-bold text-blue-900 mb-2">5. 기대 효과</h4>
                <p className="text-xs leading-relaxed text-blue-950 whitespace-pre-wrap">{plan.benefit}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
