# SockMITM :satellite:

```
$> npm install sockmitm
```

## What is this?

SockMITM is an utility package that gives you a way to quickly setup socks proxies, that you can then use to intercept both HTTP requests and HTTP responses coming from and to your applications. Intercepted messages can be dynamically changed before being forwarded to their destination, and HTTP responses can be manually crafted and returned, without even opening a connection to the remote server.

A common use case for SockMITM is to use it your testsuites, in order to easily monitor and mock your application's requests straight from your Node.js tests.

## Usage

```js
var SockMitm = require( 'sockmitm' );

SockMitm.startFilteredProxy( function ( parameters ) {

    var request = parameters.request;
    var response = parameters.response;

    if ( ! response )
        // We tell the server to only send us uncompressed data
        delete request.headers.acceptEncoding;

    if ( ! response ) {
        // You can change the request before it is sent to the remote server
        // You can also return an HTTP response object - in such a case, the request won't forwarded at all, and your response will be returned to the client
        console.log( '[REQ] ' + request.headers.host + request.url );
    } else {
        // It is now too late to alter the request, since the server already answered us!
        // However, you can still alter the response that has been sent by the server before returning it to the client
        console.log( '[RES] ' + request.headers.host + request.url + ' (' + response.status.code + ' ' + response.status.message + ')' );
    }

    // Note that you can return either a promise or a plain object, as you want
    return { request : request, response : response };
    return Promise.resolve( { request : request, response : response } );

} ).listen( 6666 );
```

```
$> curl --socks5 localhost:6666 perdu.com
```

## Caveheats

  - No authentication scheme
  - HTTP only - no HTTPS, since the intercepted data would still be encrypted
  - Various other HTTP features are silently dropped (example: Transfer-Encoding is stripped, because we always send a single chunk of data)
  - Each request (and response) will be parsed and stored as JS objects. Before being actually sent, these objects will be reformatted to produce the final network data. During this process, some informations may be lost (such as the headers names cases).

## Body types

The `body` field of the intercepted requests/responses will always be a `Buffer` instance. However, you can set it to either a new buffer, a string, a JSON structure, or null. Be aware that if you set the body to be a JSON structure, the content type will be automatically be set to `application/json`. To avoid this, you can do the stringification yourself.

## Automatic content-length

Should you want to alter the content of a request (or response), be aware that the Content-Length header will need to be changed accordingly. Fortunately, SockMITM can handle this automatically, and you probably won't have to deal with it at all. However, because of the way it is implemented, it means that you can't rely on the Content-Length header (it will be null): uses `body.length` instead.

Note that you can also force a specific Content-Length if you need to - just set it to a value other than `null`.

## HTTP compression

You may want to ensure that the `Accept-Encoding` header is stripped if you wish to intercept the body of the response. Otherwise, the server might send you gzipped data, that you would then have to unzip using the native [zlib api](https://nodejs.org/api/zlib.html). [Stripping the header altogether](https://github.com/Wisembly/sockmitm/blob/master/example.js#L10) is the best way to ensure that the remote server will only send you back uncompressed data.

## HTTP object definitions

### Requests members

method / url / version / headers / body

### Responses members

version / status / headers / body

## License (MIT)

> **Copyright © 2016 Wisembly**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
