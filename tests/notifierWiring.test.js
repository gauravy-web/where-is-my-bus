// Task 8.2: the Notifier is fed by every ETA computation (Requirement 10.1)
// and told about completed/skipped stops (Requirement 10.8). The notifier,
// the trip service writes and the database are mocked; no FCM or DB is used.
jest.mock('../src/db', () => ({}));
jest.mock('../src/services/notificationService', () => ({
  sendNotification: jest.fn(async () => undefined),
  sendMulticast: jest.fn(async () => undefined),
}));
jest.mock('../src/services/proximityNotifier', () => ({
  onEta: jest.fn(async () => null),
  onStopClosed: jest.fn(async () => []),
  forgetTrip: jest.fn(),
}));
jest.mock('../src/services/tripService', () => {
  const actual = jest.requireActual('../src/services/tripService');
  return {
    ...actual,
    completeCurrent: jest.fn(),
    skipCurrent: jest.fn(),
    endTrip: jest.fn(),
  };
});

const proximityNotifier = require('../src/services/proximityNotifier');
const tripService = require('../src/services/tripService');
const etaCoordinator = require('../src/services/etaCoordinator');
const gpsSocket = require('../src/sockets/gpsSocket');
const tripController = require('../src/controllers/tripController');

const makeTrip = (statuses, status = 'ACTIVE') => ({
  id: 't1',
  busId: 'b1',
  direction: 'PICKUP',
  status,
  stops: statuses.map((s, i) => ({ id: `ts-${i + 1}`, tripId: 't1', stopId: `s-${i + 1}`, order: i + 1, status: s, name: `Stop ${i + 1}` })),
});

const fakeRes = () => {
  const res = { statusCode: 200, body: undefined };
  res.status = jest.fn((code) => { res.statusCode = code; return res; });
  res.json = jest.fn((body) => { res.body = body; return res; });
  return res;
};

const fakeIo = () => {
  const emit = jest.fn();
  return { use: jest.fn(), on: jest.fn(), to: jest.fn(() => ({ emit })), emit };
};

const adminReq = (params) => ({ user: { id: 'u-admin', role: 'ADMIN' }, params, body: {}, query: {}, io: fakeIo() });

beforeEach(() => {
  jest.clearAllMocks();
  proximityNotifier.onStopClosed.mockImplementation(async () => []);
});

describe('ETA listener wiring (Requirement 10.1)', () => {
  test('gpsSocket(io) registers one listener that hands each ETA event to onEta', async () => {
    const active = new Set();
    const spy = jest.spyOn(etaCoordinator, 'addEtaListener').mockImplementation((fn) => {
      active.add(fn);
      return () => active.delete(fn);
    });
    try {
      gpsSocket(fakeIo());
      gpsSocket(fakeIo()); // a second setup must not double-register
      expect(spy).toHaveBeenCalledTimes(2);
      expect(active.size).toBe(1);

      const event = { busId: 'b1', trip: makeTrip(['PENDING']), fix: { recordedAt: 1 }, eta: { perStop: [], computedAt: 2, fixRecordedAt: 1 } };
      const [listener] = [...active];
      await listener(event);
      expect(proximityNotifier.onEta).toHaveBeenCalledTimes(1);
      expect(proximityNotifier.onEta).toHaveBeenCalledWith(event);
    } finally {
      spy.mockRestore();
    }
  });
});

describe('stop closed wiring (Requirement 10.8)', () => {
  test.each([
    ['complete', 'completeCurrent', 'completeStop', 'COMPLETED'],
    ['skip', 'skipCurrent', 'skipStop', 'SKIPPED'],
  ])('%s calls onStopClosed once with the updated trip and the closed TripStop', async (_label, serviceFn, handler, closedStatus) => {
    const updated = makeTrip([closedStatus, 'PENDING']);
    tripService[serviceFn].mockResolvedValue(updated);
    const res = fakeRes();

    await tripController[handler](adminReq({ id: 't1', tripStopId: 'ts-1' }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.objectContaining({ success: true, trip: updated }));
    expect(proximityNotifier.onStopClosed).toHaveBeenCalledTimes(1);
    expect(proximityNotifier.onStopClosed).toHaveBeenCalledWith(updated, updated.stops[0]);
    expect(proximityNotifier.forgetTrip).not.toHaveBeenCalled();
  });

  test('a throwing or rejecting notifier never changes the response', async () => {
    const updated = makeTrip(['COMPLETED', 'PENDING']);
    tripService.completeCurrent.mockResolvedValue(updated);
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      proximityNotifier.onStopClosed.mockImplementation(() => { throw new Error('sync boom'); });
      const res1 = fakeRes();
      await tripController.completeStop(adminReq({ id: 't1', tripStopId: 'ts-1' }), res1);
      expect(res1.statusCode).toBe(200);
      expect(res1.body).toEqual(expect.objectContaining({ success: true, trip: updated }));

      proximityNotifier.onStopClosed.mockImplementation(async () => { throw new Error('async boom'); });
      const res2 = fakeRes();
      await tripController.completeStop(adminReq({ id: 't1', tripStopId: 'ts-1' }), res2);
      await new Promise((r) => setImmediate(r));
      expect(res2.statusCode).toBe(200);
      expect(res2.body).toEqual(expect.objectContaining({ success: true, trip: updated }));
      expect(proximityNotifier.onStopClosed).toHaveBeenCalledTimes(2);
    } finally {
      errSpy.mockRestore();
    }
  });

  test('a rejected stop update (409) does not notify', async () => {
    tripService.skipCurrent.mockRejectedValue(new tripService.TripServiceError(409, 'Only the current stop can be updated'));
    const res = fakeRes();
    await tripController.skipStop(adminReq({ id: 't1', tripStopId: 'ts-2' }), res);
    expect(res.statusCode).toBe(409);
    expect(proximityNotifier.onStopClosed).not.toHaveBeenCalled();
  });
});

describe('trip end wiring', () => {
  test('ending a trip forgets its notifier state', async () => {
    const ended = makeTrip(['COMPLETED', 'CANCELLED'], 'COMPLETED');
    tripService.endTrip.mockResolvedValue(ended);
    const res = fakeRes();
    await tripController.endTripById(adminReq({ id: 't1' }), res);
    expect(res.statusCode).toBe(200);
    expect(proximityNotifier.forgetTrip).toHaveBeenCalledTimes(1);
    expect(proximityNotifier.forgetTrip).toHaveBeenCalledWith('t1');
    expect(proximityNotifier.onStopClosed).not.toHaveBeenCalled();
  });
});
