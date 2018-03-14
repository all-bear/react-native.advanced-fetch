let fetchMock;
let fetchResponseMock;
let onlineHelperMock;
let RequestQueryMock;
let settingsMock;

import Request from '../../lib/request';

beforeEach(() => {
  jest.resetModules();

  jest.doMock('../../lib/request-query', () => RequestQueryMock);
  jest.doMock('../../lib/helpers/online', () => onlineHelperMock);
  jest.doMock('../../lib/helpers/settings', () => settingsMock);

  RequestQueryMock = {
    add: jest.fn(),
    load: jest.fn()
  };

  fetchMock = jest.fn(() => new Promise(resolve => resolve({
    json: () => new Promise(resolve => resolve(fetchResponseMock))
  })));

  onlineHelperMock = {
    isOnline: jest.fn(),
    onOnline: jest.fn()
  };

  settingsMock = {
    getSettings: jest.fn(() => {
      return {
        fetch: fetchMock
      }
    })
  };
});

test('it should send request if device is online on delayed fetch', () => {
  onlineHelperMock.isOnline.mockReturnValue(Promise.resolve(true));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };

  const DelayedFetch = require('../../lib/delayed-fetch');

  return DelayedFetch.delayedFetch(testUrl, testParams).then(() => {
    expect(fetchMock.mock.calls[0][0]).toEqual(testUrl);
    expect(fetchMock.mock.calls[0][1]).toEqual(testParams);
  });
});

test('it should add request to query if device is offline on delayed fetch', () => {
  onlineHelperMock.isOnline.mockReturnValue(Promise.resolve(false));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };
  const testRequest = new Request(testUrl, testParams);

  RequestQueryMock.add.mockReturnValue(Promise.resolve(true));

  const DelayedFetch = require('../../lib/delayed-fetch');

  return DelayedFetch.delayedFetch(testUrl, testParams).catch((e) => {
    expect(fetchMock).not.toBeCalled();

    expect(RequestQueryMock.add.mock.calls[0][0]).toEqual(testRequest);

    expect(e).toEqual(new DelayedFetch.DelayedRequestError('Request was delayed because of offline connection status'));
  });
});

test('it should send requests from query if device becomes online on delayed fetch', () => {
  let onlineCb;
  onlineHelperMock.onOnline.mockImplementation((cb) => {
    onlineCb = cb;
  });
  onlineHelperMock.isOnline.mockReturnValue(Promise.resolve(true));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };
  const testRequest = new Request(testUrl, testParams);

  RequestQueryMock.load.mockReturnValue(Promise.resolve([testRequest]));

  const DelayedFetch = require('../../lib/delayed-fetch');

  DelayedFetch.init();

  return new Promise(resolve => {
    expect(RequestQueryMock.load).not.toBeCalled();
    expect(fetchMock).not.toBeCalled();

    setTimeout(() => {
      onlineCb();

      setTimeout(() => {
        expect(RequestQueryMock.load).toBeCalled();
        expect(RequestQueryMock.load.mock.calls[0][0]).toEqual(true); // param true is important, because it should clear request query

        expect(fetchMock).toBeCalled();
        expect(fetchMock.mock.calls[0][0]).toEqual(testUrl);
        expect(fetchMock.mock.calls[0][1]).toEqual(testParams);

        resolve()
      }, 0);
    }, 400);
  });
});