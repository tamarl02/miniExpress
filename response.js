/* Import Node Module */
var fs = require('fs');

/* Dictionary of statuses numbers and type */
var statusDic = {200: "OK",
                 404: "Not Found",
                 405: "Method Not Allowed",
                 500: "Internal Server Error",
				 501: "Not Implemented"
				 };

function getResponse(request, socket, rootFolder) {
	/* Timeout */
	var timeout = (request.version == "HTTP/1.0" || request.headers["CONNECTION"] == "close") ? 0 : 2000;
	
	/* Response Object */
	var res = {
		status: 200, // initialization
        version: "HTTP/1.1",
		date: undefined,
        contentType: "text/plain",
        contentLength: undefined,
        body: "",
        fileType: undefined
    }
	
	var currDate = new Date(); // Set date
	res.date = currDate.toUTCString();
    if(request["error"] != false){ // Got an error that occured in the request
        res.status = request.error["errorNum"];
        res.body = request.error["errorMes"];
        res.contentLength = res.body.length;
        socket.write(objToStr(res));
    }
	else {
        fs.stat(rootFolder, function(err,stat){
	        if (err){ // Resource was not found
                res.status = 404;
                res.body = "ERROR: Cannot find the requested resource.";
                res.contentLength = res.body.length;
                socket.write(objToStr(res));
            }
            else {
                try {
					// Return the requested file
					if (request.headers["ACCEPT"] != undefined) { 
				        var fileAsStream = fs.createReadStream(rootFolder);
				        fileAsStream.on('error', function(err) {
				            socket.end();
				        });
				        res.contentLength = stat.size;
				        res.contentType = request.headers["ACCEPT"];
				        socket.write(objToStr(res));
				        fileAsStream.pipe(socket, {end:false});
		            }
					else {
						res.status = 500;
	                    res.body = "ERROR: The server lacks the ability to fulfill the request.";
	                    res.contentLength = res.body.length;
	                    socket.write(objToStr(res));
					}
		        } 
		        catch (err) {
		            res.status = 500;
                    res.body = "ERROR: Cannot find the requested resource.";
                    res.contentLength = res.body.length;
                    socket.write(objToStr(res));
		        }
		    }
		});		
	}
	socket.setTimeout(function() { // Set timeout for closing the socket
		    socket.end("HTTP/1.1 200 OK\r\nConnection: close\r\n\r\n");
	}, timeout);
}

/* Recieves the response object and returns the http response as a string */
function objToStr(res) {
    var resString = res.version + " " + res.status + " " + statusDic[res.status] + "\r\nContent-Type: " +
                    res.contentType + "\r\nContent-Length: "+res.contentLength + "\r\nDate: " + res.date + "\r\n\r\n" + res.body;
    return resString;
}

exports.getResponse = getResponse;
