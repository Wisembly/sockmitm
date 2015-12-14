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
            datas.body = Object.stringify(datas.body);
        }

        if (datas.body !== null && datas.headers.contentLength === null)
            datas.headers.contentLength = datas.body.length;

        return datas.method + ' ' + datas.url + ' HTTP/' + datas.version.major + '.' + datas.version.minor + '\r\n' + Object.keys(datas.headers).map(function (name) {
            return formatHeaderName(name) + ': ' + datas.headers[name] + '\r\n';
        }).join('') + '\r\n' + (datas.body ? datas.body.toString() : '');

    },

    response : function (datas) {

        datas = clone(datas);
        datas.headers = clone(datas.headers);

        if (datas.body instanceof Object && !(datas.body instanceof Buffer)) {
            datas.headers.contentType = 'application/json';
            datas.body = Object.stringify(datas.body);
        }

        if (datas.body !== null && datas.headers.contentLength === null)
            datas.headers.contentLength = datas.body.length;

        delete datas.headers.transferEncoding;

        return 'HTTP/' + datas.version.major + '.' + datas.version.minor + ' ' + datas.status.code + ' ' + datas.status.message + '\r\n' + Object.keys(datas.headers).map(function (name) {
            return formatHeaderName(name) + ': ' + datas.headers[name] + '\r\n';
        }).join('') + '\r\n' + (datas.body ? datas.body.toString() : '');

    }

};

exports.formatHttpDatas = function (datas, type) {

    return formatters[type.toLowerCase()](datas);

};
