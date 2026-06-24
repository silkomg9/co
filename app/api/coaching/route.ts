import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { projectId, idea } = await request.json();

    if (!projectId || !idea) {
      return NextResponse.json({ error: 'projectId and idea are required' }, { status: 400 });
    }

    // Retrieve latest notice analysis from Firestore
    const analysisSnapshot = await adminDb
      .collection('projects')
      .doc(projectId)
      .collection('analyses')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (analysisSnapshot.empty) {
      return NextResponse.json({ error: 'No notice analysis found for this project. Please analyze notice first.' }, { status: 404 });
    }

    const analysis = analysisSnapshot.docs[0].data();
    let coachingResult;

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `
          당신은 지원사업/공모전 전문 컨설턴트이자 멘토입니다.
          제시된 [공고 분석 내용]과 사용자의 [초기 아이디어]를 대조 분석하여, 이 아이디어가 사업계획서로 작성되었을 때 경쟁력을 갖추기 위해 보완해야 할 점을 파악하고, 사용자에게 정보를 얻어내기 위한 유도 코칭 질문 3개를 작성하십시오.
          
          [코칭 질문 작성 팁]
          1. 사용자가 이해하기 쉽고 답변하기 쉬운 구체적인 질문이어야 합니다.
          2. 공고의 평가 기준(예: 기술 차별성, 실현 가능성, 예산 등)에 기초하여 부족한 구체적 수치나 방법론을 물어보십시오.
          3. 지나치게 학술적이거나 광범위한 질문은 피하십시오.

          [공고 분석 내용]
          - 사업 목적: ${analysis.summary}
          - 평가 기준: ${analysis.evaluationCriteria}
          - 지원 대상: ${analysis.target}

          [사용자 초기 아이디어]
          ${idea}

          [출력 JSON 스키마]
          {
            "questions": [
              "질문 1 (예: 기술적 구현 방식에 대한 질문)",
              "질문 2 (예: 목표 시장 및 구체적 타겟층에 대한 질문)",
              "질문 3 (예: 서비스 운영을 위한 예산 혹은 실현 단계에 대한 질문)"
            ]
          }
        `;

        const response = await model.generateContent(prompt);
        const text = response.response.text();
        coachingResult = JSON.parse(text);
      } catch (aiError) {
        console.error('AI Coaching failed, falling back to mock:', aiError);
        coachingResult = getMockQuestions(idea);
      }
    } else {
      console.warn('GEMINI_API_KEY not found. Using Mock coaching.');
      coachingResult = getMockQuestions(idea);
    }

    // Save user initial idea and target coaching questions into project document
    await adminDb.collection('projects').doc(projectId).update({
      initialIdea: idea,
      coachingQuestions: coachingResult.questions,
    });

    return NextResponse.json(coachingResult);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getMockQuestions(idea: string) {
  return {
    questions: [
      `Q1. 입력하신 아이디어(${idea.substring(0, 20)}...)의 핵심 타겟 고객은 누구이며, 기존의 유사 솔루션과 비교했을 때 어떤 독창적인 차별점을 가지고 있나요?`,
      "Q2. 이 아이디어를 상용화하기 위해 극복해야 할 가장 큰 기술적 한계 또는 규제적 이슈는 무엇이며, 이를 어떻게 해결할 계획인가요?",
      "Q3. 본 지원사업 예산(최대 5,000만원) 범위 내에서 제품 개발 및 마케팅을 추진하기 위한 구체적인 자금 집행 로드맵이 마련되어 있나요?",
    ],
  };
}
