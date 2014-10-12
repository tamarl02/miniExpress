/* Import Node Modules */
var net = require("net");
var url = require("url");
var pathModule = require("path");

/* Import Our Modules */
var serverReq = require("./request");
var serverRes = require("./response");

/* Global variables */
var rootSource = undefined;
var rootFolder = undefined;

function miniExpress(){
	var server = net.createServer(function(socket) {
		// Close socket
		socket.on('end', function(request) { 
			socket.destroy();
		});
		// Recieving data to socket
		socket.on('data', function(request) {
			var countLines = request.toString().split("(\r\n|\n)").length;
			var startLine = 0;
	        var path;
			if(rootFolder == undefined){ // Try to perform actions before calling use() function
				socket.write("HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: 31\r\nDate: " +
						    (new Date()).toUTCString() + "\r\n\r\nERROR: Should call use() first.");
			}
			else{
				do{ // Parse the data to requests and respond each request until the end of the data
					var currRequest = serverReq.requestParser(request, startLine);
					if(currRequest.path.indexOf(rootSource) == -1){ // rootSource is not a part of the url
			            path = pathModule.join(rootFolder + currRequest.path);
			        }
			        else{
			            path = pathModule.join(rootFolder, currRequest.path.substr(
								currRequest.path.indexOf(rootSource)+ rootSource.length));
			        }
					serverRes.getResponse(currRequest, socket, path);
					startLine = currRequest.lastLine;
				} while (startLine < countLines && currRequest.lastLine < countLines);
			}     
		});
	});
	
	/* miniExpress Object */
    var app = {
        use: function(obj1, obj2){
            rootSource = obj1; // Set the rootSource
			rootFolder = obj2; // Set the rootFolder
        },
        listen: function(port){
        	server.listen(port);
   		},
        close: function(){
        	server.close();
        }
    }
    return app;
}

// Called by the function recieved at "obj2"
miniExpress.static = function(rootF){
	return rootF;
}

module.exports = miniExpress;
