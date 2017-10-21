let CachedFetch;
let RequestCacheMock;
let getByRequestMock;
let addRequestMock;
let fetchMock;
let fetchResponseMock;
let onlineHelperMock;

import Request from '../../lib/request';

beforeEach(() => {
  jest.resetModules();

  jest.doMock('fetch', () => fetchMock);
  jest.doMock('../../lib/request-cache', () => RequestCacheMock);
  jest.doMock('../../lib/helpers/online', () => onlineHelperMock);

  getByRequestMock = jest.fn();
  addRequestMock = jest.fn();

  RequestCacheMock = {
    getByRequest: (req) => getByRequestMock(req),
    add: (req) => addRequestMock(req)
  };
  fetchMock = jest.fn(() => new Promise(resolve => resolve({
    json: () => new Promise(resolve => resolve(fetchResponseMock))
  })));
  onlineHelperMock = {};

  global.fetch = fetchMock;

  CachedFetch = require('../../lib/cached-fetch');
});

test('it should request for content if device is online on cached fetch', () => {
  const testResponse = {body: 'html lorem ipsum'};

  fetchResponseMock = testResponse;

  onlineHelperMock.isOnline = jest.fn(() => new Promise(resolve => resolve(true)));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };

  addRequestMock = jest.fn((request) => new Promise(resolve => resolve(true)));

  return CachedFetch.cachedFetch(testUrl, testParams).then((response) => {
    expect(fetchMock.mock.calls.length).toBe(1);
    expect(fetchMock.mock.calls[0][0]).toEqual(testUrl);
    expect(fetchMock.mock.calls[0][1]).toEqual(testParams);
    expect(addRequestMock).toBeCalled();
    expect(addRequestMock.mock.calls[0][0].getResponse()).toEqual(testResponse);

    expect(response).toEqual(testResponse);
  });
});

test('it should load content from caches if device is offline on cached fetch', () => {
  const testResponse = {body: 'html lorem ipsum'};
  onlineHelperMock.isOnline = jest.fn(() => new Promise(resolve => resolve(false)));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };
  const testRequest = new Request(testUrl, testParams);
  testRequest.setResponse(testResponse);

  getByRequestMock = jest.fn(() => new Promise(resolve => resolve(testRequest)));
  addRequestMock = jest.fn((request) => new Promise(resolve => resolve(true)));

  return CachedFetch.cachedFetch(null, null).then((response) => {
    expect(fetchMock).not.toBeCalled();
    expect(getByRequestMock).toBeCalled();

    expect(addRequestMock).toBeCalled();
    expect(addRequestMock.mock.calls[0][0].getResponse()).toEqual(testResponse);

    expect(response).toEqual(testRequest.getResponse());
  });
});

test('it should request version if device is online and request content version is different from cache version on version cached fetch', () => {
  const testVersion = 12;
  const testResponse = {body: 'html lorem ipsum'};

  onlineHelperMock.isOnline = jest.fn(() => new Promise(resolve => resolve(true)));

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

  getByRequestMock = jest.fn(() => new Promise(resolve => resolve(testRequest)));

  return CachedFetch.versionCachedFetch(testUrl, testParams, testVersionUrl).then((response) => {
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

  onlineHelperMock.isOnline = jest.fn(() => new Promise(resolve => resolve(true)));

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

  getByRequestMock = jest.fn(() => new Promise(resolve => resolve(null)));

  return CachedFetch.versionCachedFetch(testUrl, testParams, testVersionUrl).then((response) => {
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
  const testResponse = {body: 'html lorem ipsum'};

  onlineHelperMock.isOnline = jest.fn(() => new Promise(resolve => resolve(true)));

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

  getByRequestMock = jest.fn(() => new Promise(resolve => resolve(testRequest)));

  return CachedFetch.versionCachedFetch(testUrl, testParams, testVersionUrl).then((response) => {
    expect(fetchMock.mock.calls.length).toBe(1);

    expect(fetchMock.mock.calls[0][0]).toEqual(testVersionUrl);
    expect(fetchMock.mock.calls[0][1]).toEqual(testParams);

    expect(getByRequestMock.mock.calls[0][0]).toEqual(new Request(testUrl, testParams));

    expect(response).toEqual(testResponse);
  });
});

test('it get content from cache if device is offline on version cached fetch', () => {
  onlineHelperMock.isOnline = jest.fn(() => new Promise(resolve => resolve(false)));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };
  const testResponse = {body: 'html lorem ipsum'};

  const testRequest = new Request(testUrl, testParams);
  testRequest.setResponse(testResponse);

  getByRequestMock = jest.fn(() => new Promise(resolve => resolve(testRequest)));

  return CachedFetch.versionCachedFetch(testUrl, testParams, null).then((response) => {
    expect(fetchMock).not.toBeCalled();

    expect(getByRequestMock.mock.calls[0][0]).toEqual(new Request(testUrl, testParams));

    expect(response).toEqual(testResponse);
  });
});

test('it throws exception if cache is empty and if device is offline on version cached fetch', () => {
  onlineHelperMock.isOnline = jest.fn(() => new Promise(resolve => resolve(false)));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };

  getByRequestMock = jest.fn(() => new Promise(resolve => resolve(null)));

  return CachedFetch.versionCachedFetch(testUrl, testParams, null).catch((e) => {
    expect(fetchMock).not.toBeCalled();

    expect(getByRequestMock.mock.calls[0][0]).toEqual(new Request(testUrl, testParams));

    expect(e).toEqual(new CachedFetch.NoCacheForRequestError('There are no cache for request'));
  });
});

