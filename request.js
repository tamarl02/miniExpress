/* Regex */
var patternMethod = new RegExp("^(GET|PUT|DELETE|POST)$");
var patternPath = new RegExp("^((/[A-Za-z0-9_]+)/?)+$");
var patternVersion = new RegExp("^HTTP/(1\.0|1\.1)$");
var pattrenGet = new RegExp("^(application/javascript|text/plain|text/html|text/css|image/jpeg|image/gif)");
var noContent = new RegExp("^\s*(\r)*\s*$"); 

/* Supported File Suffixes and Corresponding Content-type */
var fileType = {
	js:     "application/javascript",
	html: 	"text/html",
	css: 	"text/css",
	png: 	"image/jpeg",
	txt: 	"text/plain",
	jpeg:	"image/jpeg",
	gif:	"image/gif",
	png:	"image/png"
}

function requestParser(request, startLine){
	/* Request Object */
    var req = {
        method: undefined,
        path: "",
        params: {},
        query: {},
        version: undefined,
        headers: new Object(), // Map of (header name : data)
        lastLine: undefined,
        moreRequests: true,
        error: false,
		body: {},
		bodyStr: "",
		protocol: "http",
		cookies: {},
		host: undefined,
		rootSource: "",
		get: function (headerKey){
			return req.headers[headerKey.toUpperCase()];		  		
		},
		param: function (key){
			return req.query[key.trim()];
		},
		is: function (cont){
			return (req.headers["ACCEPT"].indexOf(cont) != -1);
		}
	}
	/* Request Parser */
    var lines = request.toString().split("\n"); // create an array of the lines of the request
	
	// Parse initial line
	var InitialLine = lines[startLine].toString().split(/\s+/g);
	if(InitialLine.length != 4){ // Check number of argumants
	    req.error = {errorNum: 500, errorMes: "ERROR: cannot read initial request Line"};
		return req;
	}
	req.method = InitialLine[0]; // Receive method
	if(patternMethod.exec(req.method) ==  null){
		req.error = {errorNum:405, errorMes:"ERROR: not a GET/PUT/DELETE/POST request"};
		return req;
	}
	
	var pathSplit = InitialLine[1].split("?");
	if(pathSplit.length == 2){
		req.query = getQuery(pathSplit[1]);
	}
	req.path = InitialLine.length == 4 ? pathSplit[0] : ""; // Receive path
	
	req.version = patternVersion.test(InitialLine[2].toUpperCase()) ? patternVersion.exec(InitialLine[2].toUpperCase())[0] : ""; // Receive http version
	if(req.method == ""){
		req.error = {errorNum:405, errorMes:"ERROR: method not allowed"};
		return req;
	}
	if(req.path == ""){
		req.error = {errorNum:404, errorMes:"ERROR: illegal path"};
		return req;
	}
	if(req.version == "" ){
	    req.error = {errorNum:500, errorMes:"ERROR: illegal http version"};
		return req;
	}

	// Parse Headers
    var i = startLine + 1;
    for ( ; i < lines.length && (noContent.exec(lines[i]) == null) ; ++i){
		var colonIndex = lines[i].indexOf(":");
		if(colonIndex == -1){
			req.error = {errorNum:500, errorMes:"ERROR: cannot read initial request Line"};
			return req;
		}
    	var headerKey = lines[i].substr(0, colonIndex).toUpperCase();
    	var headerValue;
        headerValue = lines[i].substr(colonIndex + 2);
        req.headers[headerKey] = headerValue; // Insert values to header map
    }
    if(req.get("CONNECTION") == undefined){
    	req.headers["CONNECTION"] = (req.version == "HTTP/1.1") ? "keep-alive" : "close"; 
    }
    if(req.get("HOST") != undefined){
   	    req.host = req.headers["HOST"].split(":")[0];	
    }
	var suffix = req.path.split(".").length == 1 ? "txt" : req.path.split(".")[1];
	if(req.get("ACCEPT") == undefined || req.get("ACCEPT") == "" || (pattrenGet.exec(req.get("ACCEPT")) != null)){
		req.headers["ACCEPT"] = fileType[suffix];
	}
	req.headers["ACCEPT"] = pattrenGet.exec(req.get("ACCEPT")) != null ? 
							pattrenGet.exec(req.get("ACCEPT").toLowerCase())[0] : "";
	if(!equalsIgnoreCase(fileType[suffix], req.get("ACCEPT")) && req.get("ACCEPT") != ""){
		req.error = {errorNum:500, errorMes:"ERROR: mismatch of content-type and requestes file"};
	}
	var currLine = "";
	i++;
    for(; i < lines.length && patternMethod.exec(currLine) ==  null ; i++) { // Proceed to the following request (or end of data)
		req.bodyStr += lines[i];
		currLine = lines[i].split(" ")[0];
	}
    lastLine = i;
    return req;
}

// Private function that checks if two strings are equal (case insensitive)
function equalsIgnoreCase(str1, str2){
	if(str1 == undefined || str2 == undefined){
		return false;
	}
	return (str1.toString().toUpperCase() == str2.toString().toUpperCase());
}

// Private function that gets the data for req.query
function getQuery(path) {
	while(path.indexOf("+") != -1 ){
		path = path.replace("+"," ");
	}
	var query = {};
	var temp = path.split("&");
	for(i = 0 ; i < temp.length ; i++){
		var singleQuery = temp[i].split("=");
		query[singleQuery[0]] = singleQuery[1];
	}
	return query;
}

module.exports = requestParser;