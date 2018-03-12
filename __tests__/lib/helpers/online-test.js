let NetInfoMock;

beforeEach(() => {
  jest.resetModules();

  NetInfoMock = {
    isConnected: {
      addEventListener: jest.fn()
    }
  };

  jest.doMock('react-native', () => ({
    NetInfo: NetInfoMock
  }));
});

test('it should resolve promise from isOnline with `true` if NetInfo status online', () => {
  NetInfoMock.isConnected.addEventListener.mockImplementation((event, cb) => cb(true));

  const isOnline = require('../../../lib/helpers/online').isOnline;

  return isOnline().then(status => {
    expect(status).toBe(true);
  });
});

test('it should resolve promise from isOnline with `false` if NetInfo status offline', () => {
  NetInfoMock.isConnected.addEventListener.mockImplementation((event, cb) => cb(false));

  const isOnline = require('../../../lib/helpers/online').isOnline;

  return isOnline().then(status => {
    expect(status).toBe(false);
  });
});

test('it should call callback from onOnline on NetInfo status change, if status is online', () => {
  NetInfoMock.isConnected.addEventListener.mockImplementation((event, cb) => {
    setTimeout(() => {
      cb(true)
    }, 1000);
  });

  const netInfoEventListenerSpy = jest.spyOn(NetInfoMock.isConnected, 'addEventListener');

  const onOnline = require('../../../lib/helpers/online').onOnline;
  const onOnlineCb = jest.fn();

  onOnline(onOnlineCb);

  return new Promise(resolve => {
    setTimeout(() => {
      expect(onOnlineCb).toBeCalled();
      expect(netInfoEventListenerSpy.mock.calls[0][0]).toEqual('connectionChange');

      resolve();
    }, 2000);
  });
});

test('it should wait until connection status request ends and response with this status on isOnline request', () => {
  NetInfoMock.isConnected.addEventListener.mockImplementation((event, cb) => {
    setTimeout(() => {
      cb(true)
    }, 100)
  });

  const isOnline = require('../../../lib/helpers/online').isOnline;

  return isOnline().then(status => {
    expect(status).toBe(true);
  });
});