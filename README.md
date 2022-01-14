# IBM Watson Speech to Text 503 Error

## Requirements

- Node.js v16.13.0
- npm v8.1.0

## Setup

> mv .env.example .env

Add `API_KEY` and `INSTANCE` to `.env`.

> npm install

## Running

> npm start

## Expected Result

With `NUMBER_OF_CONNECTIONS=99`, we should see 
```
01 open
02 open
03 open
04 open
05 open
...
99 open
Done
```


## Actual Result

With `NUMBER_OF_CONNECTIONS=10`, we see
```
01 open
02 open
03 open
04 open
05 open
06 open
07 open
08 open
09 open
Done
```

With `NUMBER_OF_CONNECTIONS=99`, we see
```
01 open
02 open
...
75 open
76 open
/Users/joe/Development/ibm-watson-speech-to-text-503/node_modules/ws/lib/websocket.js:813
      abortHandshake(
      ^
Error: Unexpected server response: 503
    at ClientRequest.<anonymous> (/Users/joe/Development/ibm-watson-speech-to-text-503/node_modules/ws/lib/websocket.js:813:7)
    at ClientRequest.emit (node:events:390:28)
    at ClientRequest.emit (node:domain:475:12)
    at HTTPParser.parserOnIncomingClient [as onIncoming] (node:_http_client:623:27)
    at HTTPParser.parserOnHeadersComplete (node:_http_common:128:17)
    at TLSSocket.socketOnData (node:_http_client:487:22)
    at TLSSocket.emit (node:events:390:28)
    at TLSSocket.emit (node:domain:475:12)
    at addChunk (node:internal/streams/readable:315:12)
    at readableAddChunk (node:internal/streams/readable:289:9)
```

The exact number that causes the error varies.