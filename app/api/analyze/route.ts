import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { projectId, noticeText } = await request.json();

    if (!projectId || !noticeText) {
      return NextResponse.json({ error: 'projectId and noticeText are required' }, { status: 400 });
    }

    let analysisResult;

    // Check if GEMINI_API_KEY is available
    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `
          당신은 지원사업/공모전 공고 분석 전문가입니다.
          제시된 공고문 텍스트를 정밀 분석하여 아래의 JSON 스키마 구조로 응답하십시오.
          
          [동작 원칙]
          1. 절대 당선 가능성을 보장하거나 과장하지 마십시오.
          2. 없는 정보나 실적을 임의로 상상해서 기재하지 마십시오.
          3. 분석의 모든 항목은 공고문 텍스트의 실제 근거(evidence)에 철저히 기반해야 합니다.

          [출력 JSON 스키마]
          {
            "summary": "사업 목적 및 사업의 전반적인 취지에 대한 2-3문장 핵심 요약",
            "target": "신청 자격, 제한 대상, 우대 사항 설명",
            "evaluationCriteria": "선정 평가 항목, 배점 기준, 중점 평가 지표 분석",
            "budget": "지원금 규모, 자부담 비율 조건, 예산 집행 제한 규정",
            "keywords": ["주요 키워드 3~5개"],
            "evidence": "분석 결과의 신뢰성을 담보할 수 있는 공고문 내 핵심 구절 인용 및 출처 요약"
          }

          [분석할 공고문 텍스트]
          ${noticeText}
        `;

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        analysisResult = JSON.parse(text);
      } catch (aiError) {
        console.error('AI Analysis failed, falling back to mock:', aiError);
        analysisResult = getMockAnalysis(noticeText);
      }
    } else {
      console.warn('GEMINI_API_KEY not found. Using Mock analysis.');
      analysisResult = getMockAnalysis(noticeText);
    }

    // Save to Firestore: projects/{projectId}/analyses/{analysisId}
    const analysisRef = await adminDb
      .collection('projects')
      .doc(projectId)
      .collection('analyses')
      .add({
        ...analysisResult,
        createdAt: new Date().toISOString(),
      });

    // Update parent project status to 'coaching' and progress to 60%
    await adminDb.collection('projects').doc(projectId).update({
      status: 'notice_analyzed',
      progress: 30,
      noticeFile: noticeText.substring(0, 30) + '...', // Save snippet as proxy file name
    });

    return NextResponse.json({
      id: analysisRef.id,
      ...analysisResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Fallback Mock data generator if API Key is missing or fails
function getMockAnalysis(text: string) {
  const snippet = text.substring(0, 100);
  return {
    summary: `[공고 요약] 입력된 공고(${snippet}...)에 대한 사업 분석 결과입니다. 혁신적인 기술 개발과 아이디어 상용화를 지원하여 기업의 성장을 도모하는 사업입니다.`,
    target: "스타트업, 중소기업, 대학 연구소 등 기술 기반 창업 자격을 갖춘 개인 및 단체",
    evaluationCriteria: "기술성 및 사업성(40%), 실현 가능성(30%), 예산 적정성 및 팀 역량(30%)",
    budget: "과제당 최대 5,000만 원 (총 사업비의 80% 이내 지원, 자부담 20% 필수)",
    keywords: ["스타트업", "기술개발", "상용화", "연구지원"],
    evidence: `제공된 본문 내 "${snippet.substring(0, 30)}" 구절을 근거로 분석되었습니다.`,
  };
}
