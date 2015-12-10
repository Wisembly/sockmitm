var Stream = require('stream');

var parseHttpStream = require('./sources/parseHttpStream').parseHttpStream;
var createSockProxy = require('./sources/createSockProxy').createSockProxy;
var formatHttpDatas = require('./sources/formatHttpDatas').formatHttpDatas;

exports.startFilteredProxy = function startFilteredProxy(filter) {

    return createSockProxy(function (target, getInStream, getOutStream) {

        return getInStream().then(function (inputStream) {

            return parseHttpStream(inputStream, 'request').then(function (request) {

                return Promise.resolve(filter({ request : request, response : null })).then(function (parameters) {

                    if (parameters.response)
                        return parameters.response;

                    return getOutStream().then(function (outputStream) {

                        outputStream.write(formatHttpDatas(request, 'request'));

                        return parseHttpStream(outputStream, 'response', { parseBody : request.method !== 'HEAD' }).then(function (response) {
                            return Promise.resolve(filter({ request : request, response : response })).then(function (parameters) {
                                return parameters.response;
                            });
                        });

                    });

                });

            }).then(function (response) {

                inputStream.write(formatHttpDatas(response, 'response'));

            });

        });

    });

};
