let isOnline;
let onOnline;
let NetInfoMock;

beforeEach(() => {
  jest.resetModules();

  jest.doMock('react-native', () => ({
    NetInfo: NetInfoMock
  }));

  NetInfoMock = {
    isConnected: {}
  };

  ({isOnline, onOnline} = require('../../../lib/helpers/online'));
});

test('it should resolve promise from isOnline with true if NetInfo returns status `online`', () => {
  NetInfoMock.getConnectionInfo = jest.fn(() => new Promise((resolve) => resolve({type: 'online'})));

  return isOnline().then(status => {
    expect(status).toBe(true);
  });
});

test('it should resolve promise from isOnline with false if NetInfo returns status `offline`', () => {
  NetInfoMock.getConnectionInfo = jest.fn(() => new Promise((resolve) => resolve({type: 'offline'})));

  const isOnline = require('../../../lib/helpers/online').isOnline;

  return isOnline().then(status => {
    expect(status).toBe(false);
  });
});

test('it should call callback from onOnline on NetInfo status change, if status is connected', () => {
  NetInfoMock.isConnected.addEventListener = jest.fn((event, cb) => {
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