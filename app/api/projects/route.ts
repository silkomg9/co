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
      ownerId: 'user-123', // Hardcoded MVP owner
      title,
      status: 'notice_analyzed',
      createdAt: new Date().toISOString(),
      progress: 30, // Initially, 30% progress after creation
    };

    const docRef = await adminDb.collection('projects').add(newProject);
    return NextResponse.json({ id: docRef.id, ...newProject }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
