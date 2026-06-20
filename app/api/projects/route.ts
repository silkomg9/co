import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snapshot = await adminDb.collection('projects').orderBy('createdAt', 'desc').get();
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('[GET /api/projects]', message, stack);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title } = await request.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newProject = {
      ownerId: 'user-123',
      title,
      status: 'initial',
      createdAt: new Date().toISOString(),
      progress: 0,
    };

    const docRef = await adminDb.collection('projects').add(newProject);
    return NextResponse.json({ id: docRef.id, ...newProject }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('[POST /api/projects]', message, stack);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
