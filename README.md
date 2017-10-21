# Advanced Fetch

Wrapper for native fetch which provides advanced functionality, such as:

- Cached Response
- Delayed Requests

## Cached Response

Make a response to a server, and if device is offline, and there are was already done request before provide cached response, for example:
```javascript
import { cachedFetch as fetch, NoCacheForRequestError } from 'react-native.advanced-fetch';

fetch(url, params)
    .then(res => res.json()) // for now it works only with json
    .then(data => {
        // do work, data will be data from server or cached data if device is offline
    })
    .catch(err => {
        // err will be instance of NoCacheForRequestError if device is offline and no cache is available
    })
```

Make a response to a server, if device is online first request will be made to a version endpoint (response from this endpoint should be like this `{version: 2}`) if version is different from cached version, then request to a data endpoint will be made (response should contain `version` field, for example `{version: 2, firstName: 'John', lastName: 'Doe'}`), if version is same with cached version than cached version will be returned, if device is offline than behaviour will be the same with `cachedFetch`, for example

```javascript
import { versionCachedFetch as fetch, NoCacheForRequestError } from 'react-native.advanced-fetch';

fetch(url, params, versionUrl)
    .then(res => res.json()) // for now it works only with json
    .then(data => {
        // do work, data will be data from server if device is online and version is different with cached response, or cached data if device is offline or version is same with cached response
    })
    .catch(err => {
        // err will be instance of NoCacheForRequestError if device is offline and no cache is available
    })
```

## Delayed Request

Make a request to a server, and if device is offline this request will be remembered and executed when device becomes online, for example:

```javascript
import { delayedFetch as fetch, DelayedRequestError, init } from 'react-native.advanced-fetch';

init({
    onProcessedDelayedRequest: (request) => {
        // this cb will be executed when delayed request finally processed
    }
}); // you should run this to register watcher on a device internet connection status, it will execute delayed requests when device becomes online

fetch(url, params)
    .then(res => res.json()) // for now it works only with json
    .then(data => {
        // do work, data will be data from server
    })
    .catch(err => {
        // err will be instance of DelayedRequestError if device is offline and request is delayed
    })
```
