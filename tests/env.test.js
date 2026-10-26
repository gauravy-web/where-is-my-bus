// Config tests for src/config/env.js (Requirements 1.2, 1.3).
// Note: ALLOW_TEST_OTP / TEST_OTP removed (OTP auth replaced with password auth).
const fc = require('fast-check');
const { loadEnv, DEFAULT_OSRM_URL } = require('../src/config/env');

const REQUIRED = ['DATABASE_URL', 'JWT_SECRET'];

const baseEnv = () => ({
  DATABASE_URL: 'postgres://user:pass@localhost:5432/testdb',
  JWT_SECRET: 'test-jwt-secret',
});

const captureError = (fn) => {
  try {
    fn();
  } catch (err) {
    return err;
  }
  throw new Error('expected function to throw');
};

describe('loadEnv required keys', () => {
  test.each(REQUIRED)('throws naming %s when it is missing', (key) => {
    const env = baseEnv();
    delete env[key];
    const err = captureError(() => loadEnv(env));
    expect(err.message).toContain(key);
  });

  test.each(REQUIRED)('treats a blank %s as missing', (key) => {
    const env = { ...baseEnv(), [key]: '   ' };
    expect(() => loadEnv(env)).toThrow(key);
  });

  test('names both keys when both are missing', () => {
    const err = captureError(() => loadEnv({}));
    expect(err.message).toContain('DATABASE_URL');
    expect(err.message).toContain('JWT_SECRET');
  });

  test('returns the provided values when both are present', () => {
    const cfg = loadEnv(baseEnv());
    expect(cfg.DATABASE_URL).toBe(baseEnv().DATABASE_URL);
    expect(cfg.JWT_SECRET).toBe(baseEnv().JWT_SECRET);
  });

  test('does not mutate the input env', () => {
    const env = baseEnv();
    const snapshot = { ...env };
    loadEnv(env);
    expect(env).toEqual(snapshot);
  });
});

describe('loadEnv error messages never leak secrets', () => {
  // Random, non-blank secrets long enough that an accidental substring match
  // against the fixed error text is not possible.
  const secretArb = fc.string({ minLength: 12, maxLength: 64 }).filter((s) => s.trim().length >= 12);

  test('the message contains no provided value when one required key is missing', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...REQUIRED),
        secretArb,
        secretArb,
        secretArb,
        (missingKey, presentSecret, osrm, testOtp) => {
          const presentKey = REQUIRED.find((k) => k !== missingKey);
          const env = {
            [presentKey]: presentSecret,
            OSRM_URL: osrm,
            TEST_OTP: testOtp,
            FIREBASE_SERVICE_ACCOUNT: presentSecret,
          };
          const err = captureError(() => loadEnv(env));
          expect(err.message).toContain(missingKey);
          expect(err.message).not.toContain(presentSecret);
          expect(err.message).not.toContain(osrm);
          expect(err.message).not.toContain(testOtp);
        }
      ),
      { numRuns: 200 }
    );
  });
});

describe('loadEnv OSRM_URL', () => {
  test('falls back to the public demo server when unset', () => {
    expect(loadEnv(baseEnv()).OSRM_URL).toBe('https://router.project-osrm.org');
    expect(DEFAULT_OSRM_URL).toBe('https://router.project-osrm.org');
  });

  test('falls back to the default when blank', () => {
    expect(loadEnv({ ...baseEnv(), OSRM_URL: '  ' }).OSRM_URL).toBe(DEFAULT_OSRM_URL);
  });

  test('uses a provided value without the trailing slash', () => {
    const cfg = loadEnv({ ...baseEnv(), OSRM_URL: 'http://osrm.local:5000/' });
    expect(cfg.OSRM_URL).toBe('http://osrm.local:5000');
  });
});

describe('loadEnv NODE_ENV', () => {
  test('defaults to development', () => {
    expect(loadEnv(baseEnv()).NODE_ENV).toBe('development');
  });

  test('uses the provided value', () => {
    expect(loadEnv({ ...baseEnv(), NODE_ENV: 'production' }).NODE_ENV).toBe('production');
  });
});
