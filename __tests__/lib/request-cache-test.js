let RequestCache;
let AsyncStorageMock;
import Request from '../../lib/request';

beforeEach(() => {
  jest.resetModules();

  jest.doMock('react-native', () => ({
    AsyncStorage: AsyncStorageMock
  }));

  AsyncStorageMock = {};

  RequestCache = require('../../lib/request-cache');
});

test('it should save cache with added request on add new request to empty cache', () => {
  AsyncStorageMock.setItem = jest.fn(() => new Promise((resolve) => resolve()));
  AsyncStorageMock.getItem = jest.fn(() => new Promise((resolve) => resolve(null)));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };

  const testRequest = new Request(testUrl, testParams);

  const testEncodedRequest = {
    url: testUrl,
    params: testParams
  };
  const testRequestId = '23421411';

  jest.spyOn(testRequest, 'toJSON').mockImplementation(() => testEncodedRequest);
  Object.defineProperty(testRequest, 'id', {value: testRequestId});

  return RequestCache.add(testRequest).then(() => {
    expect(testRequest.toJSON).toBeCalled();
    expect(AsyncStorageMock.getItem.mock.calls[0][0]).toBe('@AdvancedFetch:cache');
    expect(AsyncStorageMock.setItem.mock.calls[0][0]).toBe('@AdvancedFetch:cache');
    expect(AsyncStorageMock.setItem.mock.calls[0][1]).toEqual(JSON.stringify({
      [testRequestId]: {
        url: testUrl,
        params: testParams
      }
    }));
  });
});

test('it should save cache with added request on add new request to filled cache', () => {
  const savedTestUrl = 'http://abracadabra3.com';
  const savedTestParams = {
    headers: {
      someKey: 'someValue'
    }
  };
  const savedTestRequestId = '345345345';


  AsyncStorageMock.setItem = jest.fn(() => new Promise((resolve) => resolve()));
  AsyncStorageMock.getItem = jest.fn(() => new Promise((resolve) => resolve(JSON.stringify({
    [savedTestRequestId]: {
      url: savedTestUrl,
      params: savedTestParams
    }
  }))));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };

  const testRequest = new Request(testUrl, testParams);

  const testEncodedRequest = {
    url: testUrl,
    params: testParams
  };
  const testRequestId = '23421411';

  jest.spyOn(testRequest, 'toJSON').mockImplementation(() => testEncodedRequest);
  Object.defineProperty(testRequest, 'id', {value: testRequestId});

  return RequestCache.add(testRequest).then(() => {
    expect(testRequest.toJSON).toBeCalled();
    expect(AsyncStorageMock.getItem.mock.calls[0][0]).toBe('@AdvancedFetch:cache');
    expect(AsyncStorageMock.setItem.mock.calls[0][0]).toBe('@AdvancedFetch:cache');
    expect(AsyncStorageMock.setItem.mock.calls[0][1]).toEqual(JSON.stringify({
      [savedTestRequestId]: {
        url: savedTestUrl,
        params: savedTestParams
      },
      [testRequestId]: {
        url: testUrl,
        params: testParams
      }
    }));
  });
});

test('it should get cache by it`s id', () => {
  const savedTestUrl = 'http://abracadabra3.com';
  const savedTestParams = {
    headers: {
      someKey: 'someValue'
    }
  };
  const savedTestRequestId = '345345345';

  AsyncStorageMock.setItem = jest.fn(() => new Promise((resolve) => resolve()));
  AsyncStorageMock.getItem = jest.fn(() => new Promise((resolve) => resolve(JSON.stringify({
    [savedTestRequestId]: {
      url: savedTestUrl,
      params: savedTestParams
    }
  }))));

  const testRequest = new Request(null, null);
  Object.defineProperty(testRequest, 'id', {value: savedTestRequestId});

  return RequestCache.getByRequest(testRequest).then((request) => {
    expect(AsyncStorageMock.getItem.mock.calls[0][0]).toBe('@AdvancedFetch:cache');
    expect(AsyncStorageMock.setItem).not.toBeCalled();

    expect(request).toEqual(new Request(savedTestUrl, savedTestParams))
  });
});

test('it should save cache with added request with response on add new request to empty cache', () => {
  AsyncStorageMock.setItem = jest.fn(() => new Promise((resolve) => resolve()));
  AsyncStorageMock.getItem = jest.fn(() => new Promise((resolve) => resolve(null)));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue'
    }
  };
  const testResponse = {
    someKey: 'someAnotherValue'
  };

  const testRequest = new Request(testUrl, testParams);

  testRequest.setResponse(testResponse);

  const testEncodedRequest = {
    url: testUrl,
    params: testParams,
    response: testResponse
  };
  const testRequestId = '23421411';

  jest.spyOn(testRequest, 'toJSON').mockImplementation(() => testEncodedRequest);
  Object.defineProperty(testRequest, 'id', {value: testRequestId});

  return RequestCache.add(testRequest).then(() => {
    expect(testRequest.toJSON).toBeCalled();
    expect(AsyncStorageMock.getItem.mock.calls[0][0]).toBe('@AdvancedFetch:cache');
    expect(AsyncStorageMock.setItem.mock.calls[0][0]).toBe('@AdvancedFetch:cache');
    expect(AsyncStorageMock.setItem.mock.calls[0][1]).toEqual(JSON.stringify({
      [testRequestId]: {
        url: testUrl,
        params: testParams,
        response: testResponse
      }
    }));
  });
});
