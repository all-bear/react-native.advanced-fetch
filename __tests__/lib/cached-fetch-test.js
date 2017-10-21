let CachedFetch;
let RequestCacheMock;
let fetchMock;
let fetchResponseMock;
let onlineHelperMock;

import Request from '../../lib/request';

beforeEach(() => {
  jest.resetModules();

  jest.doMock('fetch', () => fetchMock);
  jest.doMock('../../lib/request-cache', () => RequestCacheMock);
  jest.doMock('../../lib/helpers/online', () => onlineHelperMock);

  RequestCacheMock = {
    getByRequest: jest.fn(),
    add: jest.fn()
  };
  fetchMock = jest.fn(() => Promise.resolve({
    json: () => Promise.resolve(fetchResponseMock)
  }));

  onlineHelperMock = {
    isOnline: jest.fn()
  };

  global.fetch = fetchMock;

  CachedFetch = require('../../lib/cached-fetch');
});

test('it should request for content if device is online on cached fetch', () => {
  const testResponse = {body: 'html lorem ipsum'};

  fetchResponseMock = testResponse;

  onlineHelperMock.isOnline.mockReturnValue(Promise.resolve(true));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };

  RequestCacheMock.add.mockReturnValue(Promise.resolve(true));

  return CachedFetch.cachedFetch(testUrl, testParams).then(res => res.json()).then((response) => {
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(testUrl);
    expect(fetchMock.mock.calls[0][1]).toEqual(testParams);
    expect(RequestCacheMock.add).toBeCalled();
    expect(RequestCacheMock.add.mock.calls[0][0].getResponse()).toEqual(testResponse);

    expect(response).toEqual(testResponse);
  });
});

test('it should load content from caches if device is offline on cached fetch', () => {
  const testResponse = {body: 'html lorem ipsum'};
  onlineHelperMock.isOnline.mockReturnValue(Promise.resolve(false));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };
  const testRequest = new Request(testUrl, testParams);
  testRequest.setResponse(testResponse);

  RequestCacheMock.getByRequest.mockReturnValue(Promise.resolve(testRequest));
  RequestCacheMock.add.mockReturnValue(Promise.resolve(true));

  return CachedFetch.cachedFetch(null, null).then(res => res.json()).then((response) => {
    expect(fetchMock).not.toBeCalled();
    expect(RequestCacheMock.getByRequest).toBeCalled();

    expect(RequestCacheMock.add).toBeCalled();
    expect(RequestCacheMock.add.mock.calls[0][0].getResponse()).toEqual(testResponse);

    expect(response).toEqual(testRequest.getResponse());
  });
});

test('it should request version if device is online and request content version is different from cache version on version cached fetch', () => {
  const testVersion = 12;
  const testResponse = {body: 'html lorem ipsum'};

  onlineHelperMock.isOnline.mockReturnValue(Promise.resolve(true));

  fetchMock = jest.fn()
    .mockReturnValueOnce(new Promise(resolve => resolve({
      json: () => new Promise(resolve => resolve({version: testVersion}))
    })))
    .mockReturnValueOnce(new Promise(resolve => resolve({
      json: () => new Promise(resolve => resolve(testResponse))
    })));

  global.fetch = fetchMock;
  CachedFetch = require('../../lib/cached-fetch');

  const testVersionUrl = 'http://abracadabra.com/version';
  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };

  const testRequest = new Request(testUrl, testParams);
  testRequest.setVersion(testVersion + 1);

  RequestCacheMock.add.mockReturnValue(Promise.resolve(true));
  RequestCacheMock.getByRequest.mockReturnValue(Promise.resolve(testRequest));

  return CachedFetch.versionCachedFetch(testUrl, testParams, testVersionUrl).then(res => res.json()).then((response) => {
    expect(fetchMock).toBeCalled();
    expect(fetchMock.mock.calls.length).toEqual(2);

    expect(fetchMock.mock.calls[0][0]).toEqual(testVersionUrl);
    expect(fetchMock.mock.calls[0][1]).toEqual(testParams);
    expect(fetchMock.mock.calls[1][0]).toEqual(testUrl);
    expect(fetchMock.mock.calls[1][1]).toEqual(testParams);

    expect(response).toEqual(testResponse);
  });
});

test('it should request version if device is online and cache doesn`t exists on version cached fetch', () => {
  const testVersion = 12;
  const testResponse = {body: 'html lorem ipsum'};

  onlineHelperMock.isOnline.mockReturnValue(Promise.resolve(true));

  fetchMock = jest.fn()
    .mockReturnValueOnce(new Promise(resolve => resolve({
      json: () => new Promise(resolve => resolve({version: testVersion}))
    })))
    .mockReturnValueOnce(new Promise(resolve => resolve({
      json: () => new Promise(resolve => resolve(testResponse))
    })));

  global.fetch = fetchMock;
  CachedFetch = require('../../lib/cached-fetch');

  const testVersionUrl = 'http://abracadabra.com/version';
  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };

  const testRequest = new Request(testUrl, testParams);
  testRequest.setVersion(testVersion + 1);

  RequestCacheMock.add.mockReturnValue(Promise.resolve(true));
  RequestCacheMock.getByRequest.mockReturnValue(Promise.resolve(null));

  return CachedFetch.versionCachedFetch(testUrl, testParams, testVersionUrl).then(res => res.json()).then((response) => {
    expect(fetchMock).toBeCalled();
    expect(fetchMock.mock.calls.length).toEqual(2);

    expect(fetchMock.mock.calls[0][0]).toEqual(testVersionUrl);
    expect(fetchMock.mock.calls[0][1]).toEqual(testParams);
    expect(fetchMock.mock.calls[1][0]).toEqual(testUrl);
    expect(fetchMock.mock.calls[1][1]).toEqual(testParams);

    expect(response).toEqual(testResponse);
  });
});

test('it should request version if device is online and get content from cache if version is same on version cached fetch', () => {
  const testVersion = 12;
  const testResponse = {body: 'html lorem ipsum', version: null};

  onlineHelperMock.isOnline.mockReturnValue(Promise.resolve(true));

  fetchResponseMock = {version: testVersion};

  global.fetch = fetchMock;
  CachedFetch = require('../../lib/cached-fetch');

  const testVersionUrl = 'http://abracadabra.com/version';
  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };

  const testRequest = new Request(testUrl, testParams);
  testRequest.setVersion(testVersion);
  testRequest.setResponse(testResponse);

  RequestCacheMock.add.mockReturnValue(Promise.resolve(true));
  RequestCacheMock.getByRequest.mockReturnValue(Promise.resolve(testRequest));

  return CachedFetch.versionCachedFetch(testUrl, testParams, testVersionUrl).then(res => res.json()).then((response) => {
    expect(fetchMock.mock.calls.length).toBe(1);

    expect(fetchMock.mock.calls[0][0]).toEqual(testVersionUrl);
    expect(fetchMock.mock.calls[0][1]).toEqual(testParams);

    expect(RequestCacheMock.getByRequest.mock.calls[0][0]).toEqual(new Request(testUrl, testParams));

    expect(response).toEqual(testResponse);
  });
});

test('it should get content from cache if device is offline on version cached fetch', () => {
  onlineHelperMock.isOnline.mockReturnValue(Promise.resolve(false));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };
  const testResponse = {body: 'html lorem ipsum'};

  const testRequest = new Request(testUrl, testParams);
  testRequest.setResponse(testResponse);

  RequestCacheMock.getByRequest.mockReturnValue(Promise.resolve(testRequest));

  return CachedFetch.versionCachedFetch(testUrl, testParams, null).then(res => res.json()).then((response) => {
    expect(fetchMock).not.toBeCalled();

    expect(RequestCacheMock.getByRequest.mock.calls[0][0]).toEqual(new Request(testUrl, testParams));

    expect(response).toEqual(testResponse);
  });
});

test('it should throws exception if cache is empty and if device is offline on version cached fetch', () => {
  onlineHelperMock.isOnline.mockReturnValue(Promise.resolve(false));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };

  RequestCacheMock.getByRequest.mockReturnValue(Promise.resolve(null));

  return CachedFetch.versionCachedFetch(testUrl, testParams, null).catch((e) => {
    expect(fetchMock).not.toBeCalled();

    expect(RequestCacheMock.getByRequest.mock.calls[0][0]).toEqual(new Request(testUrl, testParams));

    expect(e).toEqual(new CachedFetch.NoCacheForRequestError('There are no cache for request'));
  });
});

test('it should save response with version if device is online and on version cached fetch', () => {
  const testVersion = 12;
  const testResponse = {body: 'html lorem ipsum', version: testVersion};

  onlineHelperMock.isOnline.mockReturnValue(Promise.resolve(true));

  fetchMock = jest.fn()
    .mockReturnValueOnce(new Promise(resolve => resolve({
      json: () => Promise.resolve({version: testVersion})
    })))
    .mockReturnValueOnce(new Promise(resolve => resolve({
      json: () => Promise.resolve(testResponse)
    })));

  const testVersionUrl = 'http://abracadabra.com/version';
  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };

  const testRequest = new Request(testUrl, testParams);
  testRequest.setVersion(testVersion);

  RequestCacheMock.getByRequest.mockReturnValue(Promise.resolve(null));
  RequestCacheMock.add.mockReturnValue(Promise.resolve(true));

  global.fetch = fetchMock;

  return CachedFetch.versionCachedFetch(testUrl, testParams, testVersionUrl).then(res => res.json()).then(() => {
    expect(RequestCacheMock.add).toBeCalled();
    expect(RequestCacheMock.add.mock.calls[0][0]).toEqual(testRequest);
  });
});
