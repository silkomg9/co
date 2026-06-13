"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Plus, FileText, Calendar, ArrowRight, Layers, LogOut, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface Project {
  id: string;
  title: string;
  status: "notice_analyzed" | "coaching" | "completed" | "initial";
  createdAt: string;
  noticeFile?: string;
  progress: number;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // Fetch projects from Firestore API
  async function fetchProjects() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("프로젝트 목록을 가져오지 못했습니다.");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setActionLoading(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!res.ok) throw new Error("프로젝트 생성에 실패했습니다.");
      const newProj = await res.json();

      setProjects([newProj, ...projects]);
      setNewTitle("");
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message || "프로젝트 생성 중 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            계획서 완성
          </span>
        );
      case "coaching":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3 w-3" />
            코칭 진행중
          </span>
        );
      case "notice_analyzed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
            <AlertCircle className="h-3 w-3" />
            공고분석 완료
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
            <Layers className="h-3 w-3" />
            작성 시작
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50 text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>공모코치 AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">홍길동님</span>
            <Link 
              href="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900 shadow-sm"
              title="로그아웃"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex-1 max-w-7xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Title Section */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">내 프로젝트</h1>
            <p className="mt-1.5 text-slate-500">공모사업 맞춤형 기획서를 생성하고 관리합니다.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 font-semibold text-white shadow-md shadow-blue-500/10 hover:bg-blue-500 transition-all active:scale-98"
          >
            <Plus className="h-4 w-4" />
            새 프로젝트 생성
          </button>
        </div>

        {/* Stats Grid */}
        <div className="mb-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">전체 프로젝트</span>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : `${projects.length}개`}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">코칭 진행 중</span>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {loading ? "..." : `${projects.filter(p => p.status === "coaching" || p.status === "notice_analyzed").length}개`}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">완성된 계획서</span>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {loading ? "..." : `${projects.filter(p => p.status === "completed").length}개`}
            </p>
          </div>
        </div>

        {/* Project List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm text-slate-500 font-semibold">데이터를 불러오는 중입니다...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">프로젝트가 없습니다</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-xs">새 프로젝트를 생성하여 공고 분석부터 계획서 작성까지 시작해보세요.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 inline-flex h-9 items-center justify-center rounded-full bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
            >
              프로젝트 생성하기
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-100/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="font-bold text-slate-950 line-clamp-1">{project.title}</h3>
                    {getStatusBadge(project.status)}
                  </div>
                  
                  {project.noticeFile && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 mb-6">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span className="line-clamp-1">{project.noticeFile}</span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                      <span>진행률</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          project.status === "completed" ? "bg-emerald-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{project.createdAt.split("T")[0]}</span>
                  </div>
                  <Link
                    href={`/project/${project.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    이어서 진행하기
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-950 mb-1">새 프로젝트 만들기</h2>
            <p className="text-xs text-slate-500 mb-6">지원하고자 하는 공모전 혹은 사업의 이름을 입력하세요.</p>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">프로젝트 제목</label>
                <input
                  type="text"
                  required
                  placeholder="예: 2026 청년 스타트업 패키지"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTitle("");
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex h-9 items-center justify-center rounded-full bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                >
                  {actionLoading ? "생성 중..." : "프로젝트 생성"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
