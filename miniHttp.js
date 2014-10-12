 /* Import Node Modules */
var net = require("net");
var url = require("url");
var pathModule = require("path");
var events = require('events');
var util = require('util');
var StringDecoder = require('string_decoder').StringDecoder;
util.inherits(serverCreator,events.EventEmitter);

/* Import Our Modules */
var serverReq = require("./request");
var serverRes = require("./response");

/* Regex */
var wholeReq = new RegExp("(\n\n|\r\n\r\n)(.+)?$");

/* Global Variables */
var app = undefined;
var queue;

function serverCreator(requestListener){
	events.EventEmitter.call(this);
	var requestData = "";
    var app = requestListener;
    var decoder = new StringDecoder('utf8');
	var server = net.createServer(function(socket) {
	
		socket.setMaxListeners(0);

		// Close socket
		var timeoutMil = 2000;
		socket.on('end', function(request) { 
			socket.destroy();
		});
		// Recieving data to socket
		socket.on('data', function(request) {
			request = decoder.write(request);
			requestData += request;
			if (wholeReq.exec(requestData) != null){ // If the request is partial
				var countLines = request.toString().split("(\r\n|\n)").length;
				var startLine = 0;
		     	var path;
				do{ // Parse the data to requests and respond each request until the end of the data
					var req = serverReq(requestData, startLine);
					var res = serverRes(req, socket);
					if (req.error != false) {
						res.send(req.error.errorNum, req.error.errorMes);
					}
					else {
						app(req, res);
						startLine = req.lastLine;
						timeoutMil = (req.get("connection").toLowerCase() == "close") ? 0 : 2000;
					}
				} while (startLine < countLines && req.lastLine < countLines);
				requestData = "";
			}
		});
		socket.on('error', function(error){});
		socket.setTimeout(function() { // Set timeout for closing the socket
		    socket.end("HTTP/1.1 200 OK\r\nConnection: close\r\n\r\n");
		}, timeoutMil);
	});
	
	server.on('error', function (e) {
		if (e.code == 'EADDRINUSE') {
			console.log('Address in use, retrying...');
			setTimeout(function () {
				server.close();
			}, 2000);
		}
	});
	
	server.setMaxListeners(0);
	
	this.close = function(callback){
		server.close(function(){console.log("server close");});
		this.emit('close', closeFunc(function(){console.log("emit close");}));
	}

	function closeFunc(callback){
		if(typeof callback == 'function'){
			callback();			
		}
	}

	this.on('close', closeFunc);

	this.listen = function(port, callback){
		console.log("listen");
		if(port == undefined){
			port = 80;
		}
		server.listen(port, function(){console.log("listen");});
	}
}

exports.createServer = function(requestListener){
	var server = new serverCreator(requestListener);
	return server;
}