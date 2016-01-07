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
