import { NextResponse } from 'next/server';
import { revokeLeaderSessionToken } from '@/lib/security';

export async function POST(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/qcen_leader_session=([^;]+)/);
  if (match) {
    revokeLeaderSessionToken(match[1]);
  }

  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = [
    'qcen_leader_session=',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ];

  if (isProd) {
    cookieOptions.push('Secure');
  }

  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', cookieOptions.join('; '));

  return response;
}
