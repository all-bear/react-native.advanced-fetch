let isOnline;
let onOnline;
let NetInfoMock;

beforeEach(() => {
  jest.resetModules();

  jest.doMock('react-native', () => ({
    NetInfo: NetInfoMock
  }));

  NetInfoMock = {
    isConnected: {
      addEventListener: jest.fn()
    }
  };

  ({isOnline, onOnline} = require('../../../lib/helpers/online'));
});

test('it should resolve promise from isOnline with true if NetInfo returns status `online`', () => {
  jest.resetModules();

  NetInfoMock.isConnected.addEventListener.mockImplementation((event, cb) => cb(true));

  const isOnline = require('../../../lib/helpers/online').isOnline;

  return isOnline().then(status => {
    expect(status).toBe(true);
  });
});

test('it should resolve promise from isOnline with false if NetInfo returns status `offline`', () => {
  jest.resetModules();

  NetInfoMock.isConnected.addEventListener.mockImplementation((event, cb) => cb(false));

  const isOnline = require('../../../lib/helpers/online').isOnline;

  return isOnline().then(status => {
    expect(status).toBe(false);
  });
});

test('it should call callback from onOnline on NetInfo status change, if status is connected', () => {
  jest.resetModules();

  NetInfoMock.isConnected.addEventListener.mockImplementation((event, cb) => {
    setTimeout(() => {
      cb(true)
    }, 1000);
  });

  jest.doMock('react-native', () => ({
    NetInfo: NetInfoMock
  }));

  const netInfoEventListenerSpy = jest.spyOn(NetInfoMock.isConnected, 'addEventListener');

  const onOnline = require('../../../lib/helpers/online').onOnline;
  const onOnlineCb = jest.fn();

  onOnline(onOnlineCb);

  return new Promise(resolve => {
    setTimeout(() => {
      expect(onOnlineCb).toBeCalled();
      expect(netInfoEventListenerSpy.mock.calls[0][0]).toEqual('change');

      resolve();
    }, 2000);
  });
});