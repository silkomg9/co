import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { projectId, answers } = await request.json();

    if (!projectId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'projectId and answers (array) are required' }, { status: 400 });
    }

    // Retrieve project metadata
    const projectRef = adminDb.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projectDoc.data()!;
    const coachingQuestions = project.coachingQuestions || [];

    // Retrieve latest analysis
    const analysisSnapshot = await adminDb
      .collection('projects')
      .doc(projectId)
      .collection('analyses')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (analysisSnapshot.empty) {
      return NextResponse.json({ error: 'Notice analysis not found for this project' }, { status: 404 });
    }

    const analysis = analysisSnapshot.docs[0].data();
    let planResult;

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const qAndAPairs = coachingQuestions
          .map((q: string, idx: number) => `Q: ${q}\nA: ${answers[idx] || '미답변'}`)
          .join('\n\n');

        const prompt = `
          당신은 전문 사업계획서 튜터 및 기획 전문가입니다.
          [공고 요약 정보], [사용자 초기 아이디어], 그리고 [코칭 질문과 답변]을 연계하여 공모 목적에 부합하는 체계적인 사업계획서 초안을 작성하십시오.
          
          [작성 지침]
          1. 당선 확률이나 선정을 무책임하게 약속하지 마십시오.
          2. 없는 실적이나 특허, 자금을 허위로 꾸며내지 마십시오.
          3. 사용자의 답변 내용을 근거로 하되, 사업계획서의 전문성을 높여줄 세련된 비즈니스 어휘와 논리적 서술 방식을 취해주십시오.

          [공고 요약 정보]
          - 사업 목적: ${analysis.summary}
          - 평가 기준: ${analysis.evaluationCriteria}
          - 지원 대상: ${analysis.target}

          [사용자 초기 아이디어]
          ${project.initialIdea}

          [코칭 문답 기록]
          ${qAndAPairs}

          [출력 JSON 스키마]
          {
            "businessName": "사용자 아이디어와 지원사업 취지에 부합하는 세련된 최종 사업명",
            "necessity": "이 사업을 추진해야 하는 사회적/기술적 필요성 및 해결하고자 하는 문제 정의",
            "purpose": "본 사업을 통해 구체적으로 달성하고자 하는 정성적/정량적 비즈니스 목적",
            "schedule": "1단계(기획 및 설계) -> 2단계(제품/개발) -> 3단계(테스트 및 검증) -> 4단계(마케팅/성과확산)로 이루어진 구체적인 추진 일정 설명",
            "indicator": "목표 달성 여부를 검증할 수 있는 핵심성과지표(KPI) 목록 및 타당한 수치 제안",
            "benefit": "사업 추진으로 유발될 경제적 편익, 고용 창출 효과 및 기술적 기대효과"
          }
        `;

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        planResult = JSON.parse(text);
      } catch (aiError) {
        console.error('AI Plan Generation failed, falling back to mock:', aiError);
        planResult = getMockPlan(project, answers);
      }
    } else {
      console.warn('GEMINI_API_KEY not found. Using Mock plan generation.');
      planResult = getMockPlan(project, answers);
    }

    // Save to Firestore: projects/{projectId}/plans/{planId}
    const planRef = await adminDb
      .collection('projects')
      .doc(projectId)
      .collection('plans')
      .add({
        ...planResult,
        createdAt: new Date().toISOString(),
      });

    // Update parent project status to 'completed' and progress to 100%
    await projectRef.update({
      status: 'completed',
      progress: 100,
      answers: answers,
    });

    return NextResponse.json({
      id: planRef.id,
      ...planResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getMockPlan(project: { initialIdea?: string; coachingQuestions?: string[] }, answers: string[]) {
  const idea = project.initialIdea || "초기 아이디어";
  const qaTexts = (project.coachingQuestions || [])
    .map((q: string, idx: number) => `- ${q}에 대한 답변: ${answers[idx] || "미입력"}`)
    .join('\n');

  return {
    businessName: `[초안] ${idea} 기반 혁신 상용화 프로젝트`,
    necessity: `기존 시장의 문제점을 해결하기 위해 본 사업의 추진이 필요합니다. 특히 사용자의 핵심 제안과 아래의 문답 내용에서 언급된 요건들을 해결하는 데에 기여할 것입니다.\n${qaTexts.substring(0, 150)}`,
    purpose: `본 과제를 성공적으로 완료하여 아이디어의 구현 검증(PoC) 및 초기 고객 검증을 마치고, 지원사업 기간 내 프로토타입 개발을 최우선 목적으로 합니다.`,
    schedule: "1. 기획/설계 (1~2개월) | 2. 프로토타입 구현 및 핵심 알고리즘 개발 (3~4개월) | 3. 베타 테스트 및 사용자 피드백 반영 (5개월) | 4. 성과 평가 및 마켓 론칭 준비 (6개월)",
    indicator: "1. 프로토타입 기능 작동 신뢰도 95% 이상 달성\n2. 사용자 베타 피드백 만족도 4.0/5.0 이상 획득\n3. 지원 사업 내 최종 시제품 평가 등급 '성공' 판정",
    benefit: `본 과제가 성공적으로 수행되면 효율성 극대화를 통해 시장의 비용을 20% 이상 절감시킬 수 있으며, 청년 인력 창출과 더불어 독자적인 기술 기술력을 확보할 것으로 기대됩니다.`,
  };
}
