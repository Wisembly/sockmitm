var Net = require('net');
var SocksV5 = require('socksv5');

function openSocketTo(target, port) {

    return new Promise(function (resolve) {

        var socket = Net.connect(port, target);

        socket.once('connect', function () {
            resolve(socket);
        });

    });

}

function waitForCompletion(socket) {

    return Promise.resolve(socket).then(function (socket) {

        if ( socket.bufferSize === 0 )
            return socket;

        return new Promise(function (resolve) {

            socket.once('drain', function () {
                resolve(socket);
            });

        });

    });

}

exports.createSockProxy = function (callback) {

    return SocksV5.createServer(function (info, accept, deny) {

        var inputStream;
        var outputStream;

        function cleanup() {

            var onReadyForClean = inputStream
                ? waitForCompletion(inputStream)
                : Promise.resolve();

            return onReadyForClean.then(function () {
                return Promise.all([ inputStream, outputStream ]);
            }).then(function (streams) {
                streams.forEach(function (stream) { if (stream) stream.destroy(); });
            });

        }

        Promise.resolve(callback(info, function () {

            if (!inputStream)
                inputStream = Promise.resolve(accept(true));

            return inputStream;

        }, function () {

            if (!outputStream)
                outputStream = openSocketTo(info.dstAddr, info.dstPort);

            return outputStream;

        })).then(function (result) {

            cleanup();

            return result;

        }, function (error) {

            cleanup();

            throw error;

        }).catch(function (error) {

            console.error(error.stack);

        });

    }).useAuth(SocksV5.auth.None());

};
