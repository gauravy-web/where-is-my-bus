// Placeholder sanity test confirming the Jest harness runs.
const fc = require('fast-check');
const request = require('supertest');

describe('test harness', () => {
  test('jest runs', () => {
    expect(1 + 1).toBe(2);
  });

  test('fast-check and supertest are installed', () => {
    expect(typeof fc.assert).toBe('function');
    expect(typeof request).toBe('function');
  });
});
