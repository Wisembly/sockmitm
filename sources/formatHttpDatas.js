var clone = require('lodash/lang/clone');
var kebabCase = require('lodash/string/kebabCase');

var formatHeaderName = function (name) {

    return kebabCase(name).replace(/\b([a-zA-Z])/g, function ($0, $1) {
        return $1.toUpperCase();
    });

};

var formatters = {

    request : function (datas) {

        datas = clone(datas);
        datas.headers = clone(datas.headers);

        if (datas.body instanceof Object && !(datas.body instanceof Buffer)) {
            datas.headers.contentType = 'application/json';
            datas.body = JSON.stringify(datas.body);
        }

        if (datas.body !== null && datas.headers.contentLength === null)
            datas.headers.contentLength = datas.body.length;

        if (datas.body == null)
            datas.body = [];

        var header = datas.method + ' ' + datas.url + ' HTTP/' + datas.version.major + '.' + datas.version.minor + '\r\n' + Object.keys(datas.headers).map(function (name) {
            return formatHeaderName(name) + ': ' + datas.headers[name] + '\r\n';
        }).join('') + '\r\n';

        return Buffer.concat( [
            new Buffer( header ),
            new Buffer( datas.body )
        ] );

    },

    response : function (datas) {

        datas = clone(datas);
        datas.headers = clone(datas.headers);

        if (datas.body instanceof Object && !(datas.body instanceof Buffer)) {
            datas.headers.contentType = 'application/json';
            datas.body = JSON.stringify(datas.body);
        }

        if (datas.body !== null && datas.headers.contentLength === null)
            datas.headers.contentLength = datas.body.length;

        if (datas.body == null)
            datas.body = [];

        delete datas.headers.transferEncoding;

        var header = 'HTTP/' + datas.version.major + '.' + datas.version.minor + ' ' + datas.status.code + ' ' + datas.status.message + '\r\n' + Object.keys(datas.headers).map(function (name) {
            return formatHeaderName(name) + ': ' + datas.headers[name] + '\r\n';
        }).join('') + '\r\n';

        return Buffer.concat( [
            new Buffer( header ),
            new Buffer( datas.body )
        ] );

    }

};

exports.formatHttpDatas = function (datas, type) {

    return formatters[type.toLowerCase()](datas);

};
