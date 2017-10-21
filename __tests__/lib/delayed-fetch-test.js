let DelayedFetch;
let fetchMock;
let fetchResponseMock;
let onlineHelperMock;
let RequestQueryMock;
let addRequestMock;
let loadRequestMock;

import Request from '../../lib/request';

beforeEach(() => {
  jest.resetModules();

  jest.doMock('fetch', () => fetchMock);
  jest.doMock('../../lib/request-query', () => RequestQueryMock);
  jest.doMock('../../lib/helpers/online', () => onlineHelperMock);

  addRequestMock = jest.fn();
  loadRequestMock = jest.fn();

  RequestQueryMock = {
    add: (req) => addRequestMock(req),
    load: (withClear) => loadRequestMock(withClear)
  };

  fetchMock = jest.fn(() => new Promise(resolve => resolve({
    json: () => new Promise(resolve => resolve(fetchResponseMock))
  })));
  onlineHelperMock = {};

  global.fetch = fetchMock;

  DelayedFetch = require('../../lib/delayed-fetch');
});

test('it should send request if device is online on delayed fetch', () => {
  onlineHelperMock.isOnline = jest.fn(() => new Promise(resolve => resolve(true)));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };

  return DelayedFetch.delayedFetch(testUrl, testParams).then(() => {
    expect(fetchMock.mock.calls[0][0]).toEqual(testUrl);
    expect(fetchMock.mock.calls[0][1]).toEqual(testParams);
  });
});

test('it should add request to query if device is offline on delayed fetch', () => {
  onlineHelperMock.isOnline = jest.fn(() => new Promise(resolve => resolve(false)));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };
  const testRequest = new Request(testUrl, testParams);

  addRequestMock = jest.fn(() => new Promise(resolve => resolve(true)));

  return DelayedFetch.delayedFetch(testUrl, testParams).catch((e) => {
    expect(fetchMock).not.toBeCalled();

    expect(addRequestMock.mock.calls[0][0]).toEqual(testRequest);

    expect(e).toEqual(new DelayedFetch.DelayedRequestError('Request was delayed because of offline connection status'));
  });
});

test('it should send requests from query if device becomes online on delayed fetch', () => {
  let onlineCb;
  onlineHelperMock.onOnline = (cb) => {
    onlineCb = cb;
  };
  onlineHelperMock.isOnline = jest.fn(() => new Promise(resolve => resolve(true)));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };
  const testRequest = new Request(testUrl, testParams);

  loadRequestMock = jest.fn(() => new Promise(resolve => resolve([testRequest])));

  DelayedFetch.init();

  return new Promise(resolve => {
    expect(loadRequestMock).not.toBeCalled();
    expect(fetchMock).not.toBeCalled();

    setTimeout(() => {
      onlineCb();

      setTimeout(() => {
        expect(loadRequestMock).toBeCalled();
        expect(loadRequestMock.mock.calls[0][0]).toEqual(true);

        expect(fetchMock.mock.calls[0][0]).toEqual(testUrl);
        expect(fetchMock.mock.calls[0][1]).toEqual(testParams);
      }, 100);

      resolve();
    }, 400);
  });
});