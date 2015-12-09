var HTTPParser = require('http-parser-js').HTTPParser;
var camelCase = require('lodash/string/camelCase');

exports.parseHttpStream = function (stream, type) {

    return new Promise(function (resolve, reject) {

        var onData = function (buffer) {

            try {

                var consumed = parser.execute(buffer);

                if (consumed !== buffer.length) {
                    throw new Error('A request buffer hasn\'t been fully consumed');
                }

            } catch (error) {

                close(reject, error);

            }

        };

        var onError = function (error) {

            close(reject, error);

        };

        var close = function (method, parameter) {

            stream.removeListener('data', onData);
            stream.removeListener('error', onError);

            method(parameter);

        };

        var parser = new HTTPParser(HTTPParser[type.toUpperCase()]);
        var bodyBufferSet = [], bodyBufferLength = 0;

        parser[HTTPParser.kOnHeaders] = function () {

            return false; // We don't want to skip parsing the body

        };

        parser[HTTPParser.kOnHeadersComplete] = function () {

            return ; // Nothing special to do there

        };

        parser[HTTPParser.kOnBody] = function (chunk, offset, length) {

            bodyBufferLength += length;

            if (offset !== 0 || length !== chunk.length) {
                bodyBufferSet.push(chunk.slice(offset, offset + length));
            } else {
                bodyBufferSet.push(chunk);
            }

        };

        parser[HTTPParser.kOnMessageComplete] = function () {

            var headers = Object.create(null);

            for (var t = 0, T = parser.info.headers.length; t < T; t += 2)
                headers[camelCase(parser.info.headers[t])] = parser.info.headers[t + 1];

            if ( type.toLowerCase( ) === 'request' ) {

                var method = HTTPParser.methods[parser.info.method];
                var url = parser.info.url;
                var version = { major : parser.info.versionMajor, minor : parser.info.versionMinor };
                var body = Buffer.concat(bodyBufferSet, bodyBufferLength);

                close(resolve, { method : method, url : url, version : version, headers : headers, body : body });

            } else if ( type.toLowerCase( ) === 'response' ) {

                var version = { major : parser.info.versionMajor, minor : parser.info.versionMinor };
                var status = { code : parser.info.statusCode, message : parser.info.statusMessage };
                var body = Buffer.concat(bodyBufferSet, bodyBufferLength);

                close(resolve, { version : version, status : status, headers : headers, body : body });

            }

        };

        stream.addListener('data', onData);
        stream.addListener('error', onError);

    });

};
