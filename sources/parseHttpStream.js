var HTTPParser = require('http-parser-js').HTTPParser;
var camelCase = require('lodash/string/camelCase');

var n = 0;

exports.parseHttpStream = function (stream, type, options) {

    var parseBody = true;

    if (options && typeof options.parseBody !== 'undefined')
        parseBody = Boolean(options.parseBody);

    return new Promise(function (resolve, reject) {

        var parser = new HTTPParser(HTTPParser[type.toUpperCase()]);
        var bodyBufferSet = [], bodyBufferLength = 0;

        var onError = function (error) {

            close(reject, error);

        };

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

        var onEnd = function () {

            try {
                parser.finish();
            } catch (error) {
                close(reject, error);
            }

        };

        var close = function (method, parameter) {

            stream.removeListener('error', onError);
            stream.removeListener('data', onData);

            method(parameter);

        };

        parser[HTTPParser.kOnHeaders] = function () {

        };

        parser[HTTPParser.kOnHeadersComplete] = function () {

            return parseBody ? false : true;

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

            if (type.toLowerCase() === 'request') {

                var request = { method : null, url : null, version : null, headers : null, body : null };

                request.method = HTTPParser.methods[parser.info.method];
                request.url = parser.info.url;
                request.version = { major : parser.info.versionMajor, minor : parser.info.versionMinor };
                request.headers = headers;
                request.body = parseBody ? Buffer.concat(bodyBufferSet, bodyBufferLength) : null;

                close(resolve, request);

            } else if (type.toLowerCase() === 'response') {

                var response = { version : null, status : null, headers : null, body : null };

                response.version = { major : parser.info.versionMajor, minor : parser.info.versionMinor };
                response.status = { code : parser.info.statusCode, message : parser.info.statusMessage };
                response.headers = headers;
                response.body = parseBody ? Buffer.concat(bodyBufferSet, bodyBufferLength) : null;

                close(resolve, response);

            }

        };

        stream.addListener('error', onError);
        stream.addListener('data', onData);

    });

};
