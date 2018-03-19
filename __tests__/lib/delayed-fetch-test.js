let fetchMock;
let fetchResponseMock;
let onlineHelperMock;
let RequestQueryMock;
let settingsMock;
let settingsDataMock;

import Request from '../../lib/request';
import _ from 'underscore';

beforeEach(() => {
  jest.resetModules();

  jest.doMock('../../lib/request-query', () => RequestQueryMock);
  jest.doMock('../../lib/helpers/online', () => onlineHelperMock);
  jest.doMock('../../lib/helpers/settings', () => settingsMock);

  RequestQueryMock = {
    add: jest.fn(),
    load: jest.fn(),
  };

  fetchMock = jest.fn(() => new Promise((resolve) => resolve({
    json: () => new Promise((resolve) => resolve(fetchResponseMock)),
  })));

  onlineHelperMock = {
    isOnline: jest.fn(),
    onOnline: jest.fn(),
  };

  settingsDataMock = {
    fetch: fetchMock,
  };

  settingsMock = {
    getSettings: jest.fn(() => settingsDataMock),
  };
});

test('it should send request if device is online on delayed fetch', () => {
  onlineHelperMock.isOnline.mockReturnValue(Promise.resolve(true));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue',
    },
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
      someKey: 'someValue',
    },
  };
  const testRequest = new Request(testUrl, testParams);

  RequestQueryMock.add.mockReturnValue(Promise.resolve(true));

  const DelayedFetch = require('../../lib/delayed-fetch');

  return DelayedFetch.delayedFetch(testUrl, testParams).catch((e) => {
    expect(fetchMock).not.toBeCalled();

    expect(_.omit(RequestQueryMock.add.mock.calls[0][0], 'meta')).toEqual(_.omit(testRequest, 'meta'));

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
      someKey: 'someValue',
    },
  };
  const testRequest = new Request(testUrl, testParams);

  RequestQueryMock.load.mockReturnValue(Promise.resolve([testRequest]));

  const DelayedFetch = require('../../lib/delayed-fetch');

  DelayedFetch.init();

  return new Promise((resolve) => {
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

        resolve();
      }, 0);
    }, 400);
  });
});

test('it should not to send delayed request if it`s lifetime exceeded, and call exceeded lifetime callback on delayed fetch', () => {
  let onlineCb;

  onlineHelperMock.onOnline.mockImplementation((cb) => {
    onlineCb = cb;
  });
  onlineHelperMock.isOnline.mockReturnValue(Promise.resolve(false));

  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue',
    },
  };

  const queryMock = [];
  RequestQueryMock.add.mockImplementation((request) => {
    queryMock.push(request);

    return Promise.resolve(request);
  });
  RequestQueryMock.load.mockReturnValue(Promise.resolve(queryMock));

  const DelayedFetch = require('../../lib/delayed-fetch');

  const onExceededDelayedRequestLifetimeMock = jest.fn();

  settingsDataMock.delayedRequestLifetime = 300;
  settingsDataMock.onExceededDelayedRequestLifetime = onExceededDelayedRequestLifetimeMock;

  DelayedFetch.init();

  return new Promise((resolve) => {
    DelayedFetch.delayedFetch(testUrl, testParams).catch(() => {
      onlineHelperMock.isOnline.mockReturnValue(Promise.resolve(true));

      setTimeout(() => {
        onlineCb();

        setTimeout(() => {
          expect(fetchMock).not.toBeCalled();
          expect(onExceededDelayedRequestLifetimeMock).toBeCalled();
          expect(onExceededDelayedRequestLifetimeMock.mock.calls[0][0].id)
            .toEqual(new Request(testUrl, testParams).id);

          resolve();
        }, 0);
      }, 400);
    });
  });
});
