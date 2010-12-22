var sys = require("sys"),
    http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    events = require("events"),
		ws = require('./mine');

var katanoo = http.createClient(8000, "server1.katanoo.com");
var request = katanoo.request("GET", "/get?uri=katanoo.com/");
var clients = [];

request.addListener('response', function (response) {
  response.setEncoding("utf8");
  response.addListener("data", function (chunk) {
		sys.puts(sys.inspect(chunk));
    clients.each(function(c) {
      c.write(chunk);
    });
  });
});
request.end();


ws.createServer(function (websocket) {
  clients.push(websocket);
	sys.puts(sys.inspect(websocket));
  websocket.addListener("connect", function (resource) {
    // emitted after handshake
    sys.puts("connect: " + resource);
  }).addListener("close", function () {
    // emitted when server or client closes connection
    clients.remove(websocket);
    sys.puts("close");
  });
}).listen(1234);

/*
http.createServer(function(request, response) {
		var str = sys.inspect(request);
		response.writeHead(200, {'Content-Type': 'text/plain'});
		response.end(str);
}).listen(1234);
sys.puts("Server running at http://localhost:1234/");

*/