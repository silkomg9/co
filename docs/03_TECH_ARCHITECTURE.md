# Technical Architecture

## Stack

Frontend:
- Next.js App Router
- TypeScript
- Tailwind CSS

Backend:
- Next.js Route Handler
- Firebase Admin SDK

Database:
- Firestore

Storage:
- Firebase Storage

Deployment:
- Vercel

## Folder

app/
components/
lib/
types/

## API

POST /api/projects
POST /api/upload
POST /api/analyze
POST /api/generate-plan

## Security

- Firebase token validation
- ownerId permission check
- Server only API keys
