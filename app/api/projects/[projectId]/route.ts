import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function verifyToken(request: Request): Promise<string> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('인증 토큰이 없습니다.');
  }
  const token = authHeader.slice(7);
  const decoded = await adminAuth.verifyIdToken(token);
  return decoded.uid;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const uid = await verifyToken(request);
    const { projectId } = await params;

    const projectRef = adminDb.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
    }

    const projectData = projectDoc.data()!;
    if (projectData.ownerId !== uid) {
      return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });
    }

    // 최신 분석 결과
    const analysisSnap = await projectRef
      .collection('analyses')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    const analysis = analysisSnap.empty ? null : analysisSnap.docs[0].data();

    // 최신 계획서
    const planSnap = await projectRef
      .collection('plans')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    const plan = planSnap.empty ? null : planSnap.docs[0].data();

    return NextResponse.json({
      project: { id: projectDoc.id, ...projectData },
      analysis,
      plan,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET /api/projects/[projectId]]', message);
    const status = message.includes('인증') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
