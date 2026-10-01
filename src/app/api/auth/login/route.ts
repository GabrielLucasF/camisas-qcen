import { NextResponse } from 'next/server';
import {
  checkRateLimit,
  resetRateLimit,
  checkGlobalLoginRateLimit,
  recordFailedLoginAttempt,
  getClientIp,
  timingSafeCompare,
  createLeaderSessionToken,
} from '@/lib/security';

export async function POST(request: Request) {
  // Global brute-force defense (max 20 failures across all IPs per 5 min)
  const globalCheck = checkGlobalLoginRateLimit(20);
  if (!globalCheck.allowed) {
    return NextResponse.json(
      {
        error: `Muitas tentativas globais no sistema. Aguarde ${globalCheck.retryAfterSeconds} segundos.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(globalCheck.retryAfterSeconds),
        },
      }
    );
  }

  const clientIp = getClientIp(request);
  const rateLimitKey = `auth_login_${clientIp}`;

  // Max 5 attempts every 15 minutes per IP
  const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: `Muitas tentativas incorretas. Aguarde ${rateCheck.retryAfterSeconds} segundos para tentar novamente.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateCheck.retryAfterSeconds),
        },
      }
    );
  }

  let body: { pin?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
  }

  const configuredPin = process.env.ADMIN_PIN?.trim();
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd && !configuredPin) {
    return NextResponse.json(
      { error: 'ADMIN_PIN não configurado no servidor em produção.' },
      { status: 500 }
    );
  }

  const expectedPin = configuredPin || '1827';
  const providedPin = typeof body.pin === 'string' ? body.pin.trim() : '';

  if (!providedPin || !timingSafeCompare(providedPin, expectedPin)) {
    recordFailedLoginAttempt();
    // Timing delay to throttle automated brute-force scripts
    await new Promise((resolve) => setTimeout(resolve, 200));
    return NextResponse.json({ error: 'PIN incorreto.' }, { status: 401 });
  }

  // Clear rate limit counter on successful login
  resetRateLimit(rateLimitKey);

  const token = createLeaderSessionToken();
  const cookieOptions = [
    `qcen_leader_session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=86400',
  ];

  if (isProd) {
    cookieOptions.push('Secure');
  }

  const response = NextResponse.json({ success: true });
  response.headers.set('Set-Cookie', cookieOptions.join('; '));

  return response;
}
