var SockMitm = require( './' );

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

}, 6666 );
