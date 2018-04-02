# Advanced Fetch

Wrapper for native fetch which provides advanced functionality, such as:

- Cached Request
- Version Cached Request
- Delayed Requests

## Cached Response

Make a reqeust to server, in a case if device is offline, and this request was done before lib will provide you with cached response, for example:
```javascript
import { cachedFetch, NoCacheForRequestError } from 'react-native-advanced-fetch';

cachedFetch(url, params)
    .then(res => {
      if (res.cached) {
        // do something if response is cached (because of offline device status)
      }
    
      return res.json()
    }) // for now it works only with json
    .then(data => {
        // do work, data will be data from server or cached data if device is offline
    })
    .catch(err => {
        // err will be instance of NoCacheForRequestError if device is offline and no cache is not available
    })
```
## Version Cached Response

Make a reqeust to server, in a case if:
- `device is online` - first request will be done to the version endpoint (`versionUrl` param for `versionCachedFetch`), this endpoint should return just version of data (basically it's hash of data, so if data changes this hash should also change) in a format: `{version: 2}`. If version is different with cached previous response version, then request to a data endpoint will be made (response should contain `version` field, for example `{version: 2, firstName: 'John', lastName: 'Doe'}`) but if version is same with cached version than cached version will be returned and no request to data endpoint will be made
- `device is offline` - behaviour will be same with `cachedFetch`

```javascript
import { versionCachedFetch, NoCacheForRequestError } from 'react-native-advanced-fetch';

versionCachedFetch(url, params, versionUrl)
    .then(res => res.json()) // for now it works only with json
    .then(data => {
        // do work, data will be data from server if device is online and version is different with cached response, or cached data if device is offline, in a case if device is offline it will be cached data
    })
    .catch(err => {
        // err will be instance of NoCacheForRequestError if device is offline and no cache is not available
    })
```

## Delayed Request

Make a request to a server, and if device is offline this request will be saved and executed when device becomes online, for example:

```javascript
import { init, delayedFetch, DelayedRequestError } from 'react-native-advanced-fetch';

init({
    onProcessedDelayedRequest: (request) => {
        // this cb will be executed when delayed request finally processed in background
    },
    startDelayedRequestWorker: true // you should run init with this option before delayedFetch requests, it will initialize background worker for delayed requests
}); 

delayedFetch(url, params)
    .then(res => res.json()) // for now it works only with json
    .then(data => {
        // do work, data will be data from server
    })
    .catch(err => {
        // err will be instance of DelayedRequestError if device is offline and request is delayed, but anyway this request will be inserterd to query and executed when device becomes online
    })
```

## Settings

To pass any settings you need to call `init` method and pass settings there:

```javascript
import { init } from 'react-native-advanced-fetch';

init({
    fetch: fetch, // fetch instance which is used for request
    waitingForConnectionChangeInterval: 100, // lib will check is device is online or offline with this interval, normally you don't need to pass this setting
    beforeSendDelayedRequest: (request) => {
        return request; // this cb will executed when right before request fetch, you can modify request here (you need to return modified request) or cancel it (just return null)
    },
    onProcessedDelayedRequest: (request) => {
        // this cb will be executed when delayed request finally processed in background
    },
    delayedRequestLifetime: Infinity, // delayed requests lifetime,
    onExceededDelayedRequestLifetime: (request) => {
        // this cb will be executed when delayed request exceed it lifetime and will not be processed 
    },
    startDelayedRequestWorker: false, // process delayed requests in background
    onOnlineOfflineStatusChange: (cb) => {
      cb(status) // you need to call cb with new status (boolean) in a case if you have custom logic for online/offline change strategy, by default `NetInfo.isConnected.addEventListener('connectionChange', cb)` is used to findout is device online/offline (by default it's offline so you need to call this cb to change status)
    }
}); 
```

## Note

You should include `ACCESS_NETWORK_STATE` permission on Android
