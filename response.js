/* Import Node Module */
var fs = require('fs');

/* Dictionary of statuses numbers and type */
var statusDic = {
    200: "OK",
    404: "Not Found",
    405: "Method Not Allowed",
    500: "Internal Server Error",
    501: "Not Implemented"
};

/* File Types */
var fileType = {
    js:   	"application/javascript",
    html:   "text/html",
    css:  	"text/css",
    png:  	"image/jpeg",
    txt:  	"text/plain",
    jpeg: 	"image/jpeg",
    gif:  	"image/gif",
    png:  	"image/png",
    buff: 	"application/octet-stream",
    json: 	"application/json"
}

function getResponse(request, socket) {
	/* Timeout */
	var timeout = (request.version == "HTTP/1.0" || request.headers["CONNECTION"] == "close") ? 0 : 2000;
	
	/* Response Object */
	var res = {
        socket: undefined,
    	statusCode: 200, // initialization
        version: "HTTP/1.1",
    	date: undefined,
        body: "",
        headers: {},
        fileType: undefined,
        set: function (field, value){
      		if(value == undefined){
      			for(var key in field) {
      				key = key.toLowerCase();
      				res.headers[key] = field[key];
      			}
      		}
      		else {
      			field = field.toLowerCase();
      			res.headers[field] = value;
      		}
        },
        get: function (field){
    		field = field.toLowerCase();
            return res.headers[field];
        },
        status: function (code){
            if(typeof(code) == 'number' && statusDic[code] != undefined){
               res.statusCode = code;            
            }
            else{
                res.statusCode = 500;
            }
            return res;
        },
        cookie: function (name, value, options){
            if(get("set-cookie") == undefined){
                res.headers["set-cookie"] = "";
            }
            var currOp;
            res.headers["set-cookie"] += name + "=" + value;
            if(options != undefined){
                for(var op in options){
                    if(op.toLowerCase == "secure" || op.toLowerCase == "httponly"){
                        currOp[op.toLowerCase] = true;
                    }
                    else{
                        currOp[op.toLowerCase] = options[op];
                    }
                }

                if(!(currOp["path"] in currOp)){
                    currOp["path"] = "/";
                }

                if(!(currOp["maxage"] in currOp)){
                    currOp["expiers"] = new Date(Date.now() + currOp["maxage"]);
                }

                if(!(currOp["expiers"] in currOp)){
                    currOp["expiers"] = "Thu, 01-Jan-1970 00:00:01 GMT";
                }
                for(var op in currOp){
                    res.headers["set-cookie"] += "; " + currOp[op];
                }
                res.headers["set-cookie"] += "\n";
            }
        },
        send: function (status, body){
			// Received 2 arguments: status and body
            if (arguments.length == 2) {
                if (typeof status == 'number') {
                  	res.status(status);
            	} 
            	else if(typeof body == 'number'){ // Order of arguments is opposite: res.send(body, status)
                    res.status(body);
                    body = (status == undefined) ? "" : status;
            	}
            }
			// Received one argument
            if (arguments.length == 1 && (typeof(arguments[0]) == 'string' || arguments[0] instanceof String)) { // Recieved body
                body = arguments[0];
                res.status(200);
            }
            if (arguments.length == 1 && typeof(arguments[0]) == 'number') { // Recieved status
                res.status(arguments[0]);
                body = "";
            }
    	    switch (typeof body) {
				case 'number': // Status
					res.headers['Content-Type'] = fileType['txt'];
					res.body = statusDic[res.statusCode];
					break;
				case 'string': // Text
					res.body = body;
					res.headers['Content-Type'] = fileType['txt'];
					break;
				case 'object':
					if (body != null && Buffer.isBuffer(body)) { // Buffer
						res.headers['Content-Type'] = fileType['buff'];
						response.set("Content-Type", "application/json;");
					}
					else{ // JSON
						try{
							req.body = JSON.parse(req.data.toString());
							response.set("Content-Type", "application/json;");
						}catch(e){}
					}
					break;
				default:
					break;            
				}

            // Get Content-Length
            if (undefined !== body && !this.get('Content-Length')) {
                var bodyLength = (Buffer.isBuffer(body)) ? Buffer.byteLength(body) : body.length;
                this.set('Content-Length', bodyLength)
            }
            socket.setEncoding('utf8');
            socket.write(objToStr(res));
        },
        json: function(bodyOrStat, body) {
            if ((typeof body === 'number') && (typeof bodyOrStat !== 'number')){
                var correctBody = bodyOrStat;
                bodyOrStat = body;
                body = correctBody;
            }
            if (body === undefined) { // Received one argument
                if (typeof bodyOrStat === 'number') { // Status
                    return res.send(bodyOrStat);
                }
                // Body
                body = bodyOrStat;
            }
            if(typeof bodyOrStat === 'number') res.status = bodyOrStat;
         
            body = JSON.stringify(body);
            if (res.get('content-type') === undefined) {
                res.set('content-type', 'application/json');
            }
         
            return res.send(body);
        }
    }
	res.socket = socket;
	var currDate = new Date(); // Set date
	res.headers["date"] = currDate.toUTCString();
	return res;
}
/* Converts a response object to a string */
function objToStr(res) {
    var cookieStr = "";
    if(res.headers["cookie"] != undefined){
        var cookies = res.headers["cookie"].split("\n");
        for (var i = 0; i < cookies.length; i++) {
            cookieStr += "Set-Cookie: " + cookies[i] + "\r\n";
        }
    }
    var resString = res.version + " " + res.statusCode + " " + statusDic[res.statusCode] + "\r\nContent-Type: " +
                    res.headers["content-type"] + "\r\nContent-Length: "+res.headers["content-length"] + 
                    "\r\nDate: " + res.headers["date"]+ "\r\n" +cookieStr + "\r\n" + res.body;
    return resString;
}

module.exports = getResponse;