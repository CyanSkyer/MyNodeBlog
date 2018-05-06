/**
 * Created by 王勇超 on 2018/5/5.
 */

//测试负载均衡

var http = require('http');

var server1 = http.createServer(function (req, res) {
    console.log("Request for:  " + req.url + "-- port 8586 ");
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello Node.js\n');
}).listen(8586, "127.0.0.1");

var server2 = http.createServer(function (req, res) {
    console.log("Request for:  " + req.url + "-- port 8587 ");
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello Node.js\n');
}).listen(8587, "127.0.0.1");

server1.once('listening', function() {
    console.log('Server running at http://127.0.0.1:8586/');
});

server2.once('listening', function() {
    console.log('Server running at http://127.0.0.1:8587/');
});