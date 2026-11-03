const { loadEnv } = require('../src/config/env');

const base = { DATABASE_URL: 'postgres://u:p@h/db', JWT_SECRET: 's' };

describe('GPS env config', () => {
  test('defaults', () => {
    expect(loadEnv(base)).toMatchObject({
      GPS_DEVICE_TIMEOUT_MS: 30000,
      GPS_MOBILE_FRESH_MS: 30000,
      GPS_SWITCHBACK_COUNT: 3,
      GPS_VERIFY_COUNT: 3,
    });
  });

  test('overrides', () => {
    expect(loadEnv({ ...base, GPS_DEVICE_TIMEOUT_MS: '45000', GPS_SWITCHBACK_COUNT: '5' }))
      .toMatchObject({ GPS_DEVICE_TIMEOUT_MS: 45000, GPS_SWITCHBACK_COUNT: 5 });
  });

  test.each([['GPS_DEVICE_TIMEOUT_MS', '100'], ['GPS_SWITCHBACK_COUNT', '0'], ['GPS_VERIFY_COUNT', 'abc']])(
    'rejects invalid %s without leaking the value', (key, value) => {
      expect(() => loadEnv({ ...base, [key]: value })).toThrow(`Invalid env: ${key} must be an integer between`);
      try { loadEnv({ ...base, [key]: value }); } catch (e) { expect(e.message).not.toContain(value === 'abc' ? 'abc' : `: ${value}`); }
    });
});
