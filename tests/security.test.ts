import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  timingSafeCompare,
  checkRateLimit,
  resetRateLimit,
  checkGlobalLoginRateLimit,
  recordFailedLoginAttempt,
  getClientIp,
  createLeaderSessionToken,
  verifyLeaderSessionToken,
  revokeLeaderSessionToken,
  verifyRequestOrigin,
  sanitizeString,
  sanitizePhone,
  sanitizeForCsv,
} from '../src/lib/security';

describe('Security Suite - Authentication & Cryptography', () => {
  test('timingSafeCompare validates matching strings', () => {
    assert.strictEqual(timingSafeCompare('1827', '1827'), true);
    assert.strictEqual(timingSafeCompare('', ''), true);
    assert.strictEqual(timingSafeCompare('secret-token-qcen-2026', 'secret-token-qcen-2026'), true);
  });

  test('timingSafeCompare rejects non-matching strings safely', () => {
    assert.strictEqual(timingSafeCompare('1827', '1828'), false);
    assert.strictEqual(timingSafeCompare('1827', '182'), false);
    assert.strictEqual(timingSafeCompare('1827', '18270'), false);
    assert.strictEqual(timingSafeCompare('1827', ''), false);
  });

  test('createLeaderSessionToken produces verifiable HMAC token', () => {
    const token = createLeaderSessionToken();
    assert.strictEqual(typeof token, 'string');
    assert.ok(token.includes('.'));
    assert.strictEqual(verifyLeaderSessionToken(token), true);
  });

  test('verifyLeaderSessionToken rejects tampered signature', () => {
    const token = createLeaderSessionToken();
    const [payload, sig] = token.split('.');
    const tamperedSig = sig.slice(0, -2) + (sig.endsWith('a') ? 'b' : 'a');
    const tamperedToken = `${payload}.${tamperedSig}`;
    assert.strictEqual(verifyLeaderSessionToken(tamperedToken), false);
  });

  test('verifyLeaderSessionToken rejects tampered payload', () => {
    const token = createLeaderSessionToken();
    const [, sig] = token.split('.');
    const fakePayload = Buffer.from(JSON.stringify({ authenticated: true, exp: 9999999999999 })).toString('base64url');
    const tamperedToken = `${fakePayload}.${sig}`;
    assert.strictEqual(verifyLeaderSessionToken(tamperedToken), false);
  });

  test('verifyLeaderSessionToken rejects malformed or null tokens', () => {
    assert.strictEqual(verifyLeaderSessionToken(null), false);
    assert.strictEqual(verifyLeaderSessionToken(undefined), false);
    assert.strictEqual(verifyLeaderSessionToken(''), false);
    assert.strictEqual(verifyLeaderSessionToken('not-a-token'), false);
    assert.strictEqual(verifyLeaderSessionToken('a.b.c'), false);
  });

  test('revokeLeaderSessionToken immediately invalidates token server-side', () => {
    const token = createLeaderSessionToken();
    assert.strictEqual(verifyLeaderSessionToken(token), true);
    revokeLeaderSessionToken(token);
    assert.strictEqual(verifyLeaderSessionToken(token), false);
  });
});

describe('Security Suite - IP Anti-Spoofing & Network Defense', () => {
  test('getClientIp prioritizes x-vercel-ip edge header', () => {
    const req = new Request('http://localhost/api/test', {
      headers: {
        'x-vercel-ip': '203.0.113.195',
        'x-real-ip': '198.51.100.1',
        'x-forwarded-for': '1.2.3.4, 5.6.7.8',
      },
    });
    assert.strictEqual(getClientIp(req), '203.0.113.195');
  });

  test('getClientIp prioritizes x-real-ip over spoofable x-forwarded-for', () => {
    const req = new Request('http://localhost/api/test', {
      headers: {
        'x-real-ip': '198.51.100.42',
        'x-forwarded-for': '1.1.1.1, 2.2.2.2',
      },
    });
    assert.strictEqual(getClientIp(req), '198.51.100.42');
  });

  test('getClientIp takes last trusted proxy hop from x-forwarded-for', () => {
    const req = new Request('http://localhost/api/test', {
      headers: {
        'x-forwarded-for': '1.1.1.1, 198.51.100.50',
      },
    });
    // First IP (1.1.1.1) was client injected; last IP (198.51.100.50) is proxy appended
    assert.strictEqual(getClientIp(req), '198.51.100.50');
  });

  test('getClientIp falls back to 127.0.0.1 on invalid or injected strings', () => {
    const req = new Request('http://localhost/api/test', {
      headers: {
        'x-real-ip': 'malicious-script-injection-attempt',
        'x-forwarded-for': '<script>alert(1)</script>',
      },
    });
    assert.strictEqual(getClientIp(req), '127.0.0.1');
  });
});

describe('Security Suite - Rate Limiting & Brute Force Defense', () => {
  test('checkRateLimit blocks excessive attempts and resets correctly', () => {
    const testKey = `test_limit_${Date.now()}`;
    const maxAttempts = 3;
    const windowMs = 5000;

    // First 3 attempts must be allowed
    const r1 = checkRateLimit(testKey, maxAttempts, windowMs);
    assert.strictEqual(r1.allowed, true);
    const r2 = checkRateLimit(testKey, maxAttempts, windowMs);
    assert.strictEqual(r2.allowed, true);
    const r3 = checkRateLimit(testKey, maxAttempts, windowMs);
    assert.strictEqual(r3.allowed, true);

    // 4th attempt must be blocked
    const r4 = checkRateLimit(testKey, maxAttempts, windowMs);
    assert.strictEqual(r4.allowed, false);
    assert.ok(r4.retryAfterSeconds > 0);

    // Reset should unblock immediately
    resetRateLimit(testKey);
    const rAfterReset = checkRateLimit(testKey, maxAttempts, windowMs);
    assert.strictEqual(rAfterReset.allowed, true);
  });

  test('checkGlobalLoginRateLimit throttles after excessive failures', () => {
    // Record multiple failures
    for (let i = 0; i < 20; i += 1) {
      recordFailedLoginAttempt();
    }
    const check = checkGlobalLoginRateLimit(20);
    assert.strictEqual(check.allowed, false);
    assert.ok(check.retryAfterSeconds > 0);
  });
});

describe('Security Suite - CSRF & Origin Verification', () => {
  test('verifyRequestOrigin accepts matching host and origin', () => {
    const req = new Request('http://example.com/api/orders', {
      headers: {
        host: 'example.com',
        origin: 'http://example.com',
      },
    });
    assert.strictEqual(verifyRequestOrigin(req), true);
  });

  test('verifyRequestOrigin rejects cross-origin spoofing', () => {
    const req = new Request('http://example.com/api/orders', {
      headers: {
        host: 'example.com',
        origin: 'http://malicious-attacker.com',
      },
    });
    assert.strictEqual(verifyRequestOrigin(req), false);
  });
});

describe('Security Suite - Input Sanitization & Anti-Injection', () => {
  test('sanitizeString strips HTML tags to prevent stored XSS', () => {
    const dirty = '<script>alert("hack")</script>João Silva<img src=x onerror=alert(1)>';
    const cleaned = sanitizeString(dirty, 100);
    assert.strictEqual(cleaned, 'alert("hack")João Silva');
    assert.ok(!cleaned.includes('<'));
    assert.ok(!cleaned.includes('>'));
  });

  test('sanitizeString strips nested HTML tags iteratively', () => {
    const dirty = '<script><script>alert(1)</script></script>João';
    const cleaned = sanitizeString(dirty, 100);
    assert.strictEqual(cleaned, 'alert(1)João');
    assert.ok(!cleaned.includes('<'));
    assert.ok(!cleaned.includes('>'));
  });

  test('sanitizeString strips control characters and null bytes', () => {
    const dirty = 'Nome\x00\x08Com\x1FControle';
    const cleaned = sanitizeString(dirty, 100);
    assert.strictEqual(cleaned, 'NomeComControle');
  });

  test('sanitizeString enforces maximum length', () => {
    const longString = 'a'.repeat(300);
    const cleaned = sanitizeString(longString, 50);
    assert.strictEqual(cleaned.length, 50);
  });

  test('sanitizePhone removes invalid characters and formats safely', () => {
    const dirty = '(33) 99866-9831 <script>';
    const cleaned = sanitizePhone(dirty);
    assert.strictEqual(cleaned, '(33) 99866-9831');
    assert.ok(!cleaned.includes('<'));
  });

  test('sanitizeForCsv neutralizes CSV Formula Injection (CWE-1236)', () => {
    // Attack payloads that execute commands or fetch URLs in Excel/LibreOffice
    const attackFormula1 = '=cmd|"/C calc"!A0';
    const attackFormula2 = '+SUM(1+1)';
    const attackFormula3 = '-2+3';
    const attackFormula4 = '@SUM(A1:A10)';
    const attackFormula5 = '\t=1+1';
    const attackFormula6 = '   =cmd|/C';
    const attackFormula7 = '\n=1+1';

    assert.strictEqual(sanitizeForCsv(attackFormula1), '"\'=cmd|""/C calc""!A0"');
    assert.strictEqual(sanitizeForCsv(attackFormula2), '"\'+SUM(1+1)"');
    assert.strictEqual(sanitizeForCsv(attackFormula3), '"\'-2+3"');
    assert.strictEqual(sanitizeForCsv(attackFormula4), '"\'@SUM(A1:A10)"');
    assert.strictEqual(sanitizeForCsv(attackFormula5), '"\'\t=1+1"');
    assert.strictEqual(sanitizeForCsv(attackFormula6), '"\'   =cmd|/C"');
    assert.strictEqual(sanitizeForCsv(attackFormula7), '"\'\n=1+1"');

    // Safe content remains normally quoted
    const safeContent = 'João Silva';
    assert.strictEqual(sanitizeForCsv(safeContent), '"João Silva"');

    // Quotes are properly escaped
    const withQuotes = 'Nome "Apelido" Sobrenome';
    assert.strictEqual(sanitizeForCsv(withQuotes), '"Nome ""Apelido"" Sobrenome"');
  });
});

