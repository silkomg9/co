import { GoogleGenerativeAI } from '@google/generative-ai';

export interface WebSource {
  title: string;
  uri: string;
}

export interface ResearchResult {
  text: string;
  sources: WebSource[];
}

/**
 * Gemini Google 검색 그라운딩으로 최신 웹 자료를 리서치한다.
 * 검색 그라운딩은 JSON 강제 출력과 동시 사용이 불가하므로, 이 함수는
 * "리서치(텍스트+출처) → 이후 JSON 종합" 2단계 파이프라인의 1단계를 담당한다.
 */
export async function researchWeb(apiKey: string, query: string): Promise<ResearchResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  // SDK 0.24.x 타입에 googleSearch 그라운딩 도구가 아직 정의돼 있지 않아 캐스팅으로 우회 (런타임 정상)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [{ googleSearch: {} }],
  } as unknown as Parameters<typeof genAI.getGenerativeModel>[0]);

  const res = await model.generateContent(query);
  const r = res.response;
  const text = r.text();

  // groundingMetadata는 0.24.x 타입에 없어 any로 접근
  const chunks =
    (r.candidates?.[0] as unknown as {
      groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }> };
    })?.groundingMetadata?.groundingChunks ?? [];

  const sources: WebSource[] = [];
  const seen = new Set<string>();
  for (const c of chunks) {
    const uri = c.web?.uri;
    const title = c.web?.title;
    if (uri && !seen.has(uri)) {
      seen.add(uri);
      sources.push({ title: title ?? uri, uri });
    }
  }

  return { text, sources };
}
