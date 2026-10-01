import { NextResponse } from 'next/server';
import { verifyLeaderRequest } from '@/lib/security';

export async function GET(request: Request) {
  const isValid = verifyLeaderRequest(request);
  if (!isValid) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
