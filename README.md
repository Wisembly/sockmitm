# sockmitm

```
$> npm install sockmitm
```

## What is this?

Sockmitm is a simple package that can help you to quickly set up a socks proxy to intercept both HTTP requests and HTTP responses. Intercepted messages may be dynamically changed before forwarded them to their correct destination.

A common use case for Sockmitm might be to use it with a Phantomjs process, in order to easily monitor & mock the network transactions, straight from your tests (assuming they have been wrote in Javascript too).

## Usage

```js
var SockMitm = require( 'sockmitm' );

SockMitm.startFilteredProxy( function ( parameters ) {

    var request = parameters.request;
    var response = parameters.response;

    if ( ! response ) {
        // You can change the request before we send it to the remote server
        // You can also return an HTTP response object - in such a case, the request isn't forwarded at all, and your response becomes the "server response"
        console.log( '[REQ] ' + request.headers.host + request.url );
    } else {
        // Too late to change the request, since the server already answered us!
        // However, you can still alter the response sent by the server
        console.log( '[RES] ' + request.headers.host + request.url + ' (' + response.status.code + ' ' + response.status.message + ')' );
    }

    // You can return either a promise or a plain object, as you want
    return { request : request, response : response };
    return Promise.resolve( { request : request, response : response } );

} ).listen( 6666 );
```

```
$> curl --socks5 localhost:6666 perdu.com
```

## Caveheats

  - No authentication scheme
  - HTTP only - no HTTPS
  - Various other HTTP features are silently dropped (example: Transfer-Encoding is stripped, because we always send a single chunk of data)
  - Each request (and response) will be parsed, then the result of this parsing will be used to produce the final requests/responses. During this process, some informations may be lost (such as the case of the header names).

## Automatic content-length

Should you want to alter the content of a request (or response), be aware that the Content-Length header will need to be changed accordingly. Fortunately, Sockmitm can handle this automatically, and you probably won't have to deal with it at all. However, because of the way it is implemented, it means that you can't rely on the Content-Length header (it will be null): uses `body.length` instead.

Note that you can also force a specific Content-Length if you need to - just set it to a value other than `null`.

## HTTP Compression

Don't forget to remove the `Accept-Encoding` headers if you wish to intercept the body of the response. Otherwise, the server might send you gzipped data, that you would then have to unzip using the native [zlib api](https://nodejs.org/api/zlib.html).

## HTTP Object definitions

### Request

  - method
  - url
  - version
  - headers
  - body

### Response

  - version
  - status
  - headers
  - body

## License (MIT)

> **Copyright © 2016 Wisembly**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
