var Net = require('net');
var SocksV5 = require('socksv5');

function openSocketTo(target, port) {

    return new Promise(function (resolve) {

        var socket = Net.connect(port, target);

        socket.on('connect', function () {
            resolve(socket);
        });

    });

}

exports.createSockProxy = function (callback, port) {

    return SocksV5.createServer(function (info, accept, deny) {

        var inputStream;
        var outputStream;

        Promise.resolve(callback(info, function () {

            if (!inputStream)
                inputStream = Promise.resolve(accept(true));

            return inputStream;

        }, function () {

            if (!outputStream)
                outputStream = openSocketTo(info.dstAddr, info.dstPort);

            return outputStream;

        })).catch(function (error) {

            Promise.all([ inputStream, outputStream ]).then(function (streams) {
                streams.forEach(function (stream) { if (stream) stream.destroy(); });
            });

        });

    }).useAuth(SocksV5.auth.None()).listen(port);

};
