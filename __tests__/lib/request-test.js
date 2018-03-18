import Request from '../../lib/request';

test('it should set url and params from constructor', () => {
  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue',
    },
  };

  const request = new Request(testUrl, testParams);

  expect(request.url).toEqual(testUrl);
  expect(request.params).toEqual(testParams);
});

test('it should be able to store response', () => {
  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue',
    },
  };
  const testResponse = {
    someKey: 'someAnotherValue',
  };

  const request = new Request(testUrl, testParams);

  request.setResponse(testResponse);

  expect(request.url).toEqual(testUrl);
  expect(request.params).toEqual(testParams);
  expect(request.response).toEqual(testResponse);
});

test('it should generate id based on url and params', () => {
  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue',
    },
  };

  const request = new Request(testUrl, testParams);

  expect(request.id).toBeTruthy();
});

test('it should generate uniq id based on url and params', () => {
  const testUrl1 = 'http://abracadabra.com';
  const testParams1 = {
    headers: {
      someKey: 'someValue',
    },
  };

  const testUrl2 = 'http://abracadabra.com';
  const testParams2 = {
    headers: {
      someKey: 'someAnotherValue',
    },
  };

  const request1 = new Request(testUrl1, testParams1);
  const request2 = new Request(testUrl2, testParams2);

  expect(request1.id).not.toEqual(request2.id);
});

test('it should get ready for json encoding', () => {
  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue',
    },
  };

  const testResponse = {
    someKey: 'someAnotherValue',
  };

  const request = new Request(testUrl, testParams);

  request.setResponse(testResponse);

  expect(JSON.stringify(request)).toEqual(JSON.stringify({
    url: testUrl,
    params: testParams,
    response: testResponse,
  }));
});

test('it should get ready for json decoding', () => {
  const testUrl = 'http://abracadabra.com';
  const testParams = {
    headers: {
      someKey: 'someValue',
    },
  };
  const testResponse = {
    someKey: 'someAnotherValue',
  };

  const request = Request.fromJSON({
    url: testUrl,
    params: testParams,
    response: testResponse,
  });

  expect(request.url).toEqual(testUrl);
  expect(request.params).toEqual(testParams);
  expect(request.getResponse()).toEqual(testResponse);
});
