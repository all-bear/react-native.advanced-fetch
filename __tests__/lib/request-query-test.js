let AsyncStorageMock;
import Request from '../../lib/request';

beforeEach(() => {
  jest.resetModules();

  jest.doMock('react-native', () => ({
    AsyncStorage: AsyncStorageMock,
  }));

  AsyncStorageMock = {
    setItem: jest.fn(),
    getItem: jest.fn(),
  };
});

test('it should save query with added request on add new request to empty query', () => {
  AsyncStorageMock.setItem.mockReturnValue(Promise.resolve());
  AsyncStorageMock.getItem.mockReturnValue(Promise.resolve(null));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue',
    },
  };

  const testRequest = new Request(testUrl, testParams);

  const testEncodedRequest = {
    url: testUrl,
    params: testParams,
  };

  jest.spyOn(testRequest, 'toJSON').mockImplementation(() => testEncodedRequest);

  const RequestQuery = require('../../lib/request-query');

  return RequestQuery.add(testRequest).then(() => {
    expect(testRequest.toJSON).toBeCalled();
    expect(AsyncStorageMock.getItem.mock.calls[0][0]).toBe('@AdvancedFetch:query');
    expect(AsyncStorageMock.setItem.mock.calls[0][0]).toBe('@AdvancedFetch:query');
    expect(AsyncStorageMock.setItem.mock.calls[0][1]).toEqual(JSON.stringify([
      {
        url: testUrl,
        params: testParams,
      },
    ]));
  });
});

test('it should save query with added request on add new request to filled query', () => {
  const savedTestUrl = 'http://abracadabra3.com';
  const savedTestParams = {
    headers: {
      someKey: 'someValue',
    },
  };


  AsyncStorageMock.setItem.mockReturnValue(Promise.resolve());
  AsyncStorageMock.getItem.mockReturnValue(Promise.resolve(JSON.stringify([
    {
      url: savedTestUrl,
      params: savedTestParams,
    },
  ])));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue',
    },
  };

  const testRequest = new Request(testUrl, testParams);

  const testEncodedRequest = {
    url: testUrl,
    params: testParams,
  };

  jest.spyOn(testRequest, 'toJSON').mockImplementation(() => testEncodedRequest);

  const RequestQuery = require('../../lib/request-query');

  return RequestQuery.add(testRequest).then(() => {
    expect(testRequest.toJSON).toBeCalled();
    expect(AsyncStorageMock.getItem.mock.calls[0][0]).toBe('@AdvancedFetch:query');
    expect(AsyncStorageMock.setItem.mock.calls[0][0]).toBe('@AdvancedFetch:query');

    expect(AsyncStorageMock.setItem.mock.calls[0][1]).toEqual(JSON.stringify([
      {
        url: savedTestUrl,
        params: savedTestParams,
      },
      {
        url: testUrl,
        params: testParams,
      },
    ]));
  });
});

test('it should load query', () => {
  const savedTestUrl = 'http://abracadabra3.com';
  const savedTestParams = {
    headers: {
      someKey: 'someValue',
    },
  };
  AsyncStorageMock.setItem.mockReturnValue(Promise.resolve());
  AsyncStorageMock.getItem.mockReturnValue(Promise.resolve(JSON.stringify([
    {
      url: savedTestUrl,
      params: savedTestParams,
    },
  ])));

  const RequestQuery = require('../../lib/request-query');

  return RequestQuery.load().then((query) => {
    expect(AsyncStorageMock.setItem).not.toBeCalled();
    expect(AsyncStorageMock.getItem.mock.calls[0][0]).toBe('@AdvancedFetch:query');

    expect(query).toEqual([new Request(savedTestUrl, savedTestParams)]);
  });
});

test('it should clear query if flag is presented', () => {
  const savedTestUrl = 'http://abracadabra3.com';
  const savedTestParams = {
    headers: {
      someKey: 'someValue',
    },
  };

  AsyncStorageMock.setItem.mockReturnValue(Promise.resolve());
  AsyncStorageMock.getItem.mockReturnValue(Promise.resolve(JSON.stringify([
    {
      url: savedTestUrl,
      params: savedTestParams,
    },
  ])));

  const RequestQuery = require('../../lib/request-query');

  return RequestQuery.load(true).then((query) => {
    expect(AsyncStorageMock.getItem.mock.calls[0][0]).toBe('@AdvancedFetch:query');
    expect(AsyncStorageMock.setItem.mock.calls[0][0]).toBe('@AdvancedFetch:query');
    expect(AsyncStorageMock.setItem.mock.calls[0][1]).toBe('[]');

    expect(query).toEqual([new Request(savedTestUrl, savedTestParams)]);
  });
});
