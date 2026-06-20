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

export async function GET(request: Request) {
  try {
    const uid = await verifyToken(request);
    const snapshot = await adminDb
      .collection('projects')
      .where('ownerId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET /api/projects]', message);
    const status = message.includes('인증') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const uid = await verifyToken(request);
    const { title } = await request.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newProject = {
      ownerId: uid,
      title,
      status: 'initial',
      createdAt: new Date().toISOString(),
      progress: 0,
    };

    const docRef = await adminDb.collection('projects').add(newProject);
    return NextResponse.json({ id: docRef.id, ...newProject }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[POST /api/projects]', message);
    const status = message.includes('인증') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
