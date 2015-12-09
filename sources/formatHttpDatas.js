var clone = require('lodash/lang/clone');
var kebabCase = require('lodash/string/kebabCase');

var formatHeaderName = function (name) {

    return kebabCase(name).replace(/\b([a-zA-Z])/g, function ($0, $1) {
        return $1.toUpperCase();
    });

};

var formatters = {

    request : function (datas) {

        return datas.method + ' ' + datas.url + ' HTTP/' + datas.version.major + '.' + datas.version.minor + '\n' + Object.keys(datas.headers).map(function (name) {
            return formatHeaderName(name) + ': ' + datas.headers[name] + '\n';
        }).join('') + '\n' + datas.body;

    },

    response : function (datas) {

        datas = clone(datas);
        datas.headers = clone(datas.headers);

        delete datas.headers.transferEncoding;

        return 'HTTP/' + datas.version.major + '.' + datas.version.minor + ' ' + datas.status.code + ' ' + datas.status.message + '\n' + Object.keys(datas.headers).map(function (name) {
            return formatHeaderName(name) + ': ' + datas.headers[name] + '\n';
        }).join('') + '\n' + datas.body;

    }

};

exports.formatHttpDatas = function (datas, type) {

    return formatters[type.toLowerCase()](datas);

};
