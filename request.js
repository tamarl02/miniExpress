/* Regex */
var patternMethod = new RegExp("GET");
var patternContent = new RegExp("\\S+");
var patternVersion = new RegExp("HTTP/(1\.0|1\.1)");
var pattrenGet = new RegExp("(application/javascript|text/plain|text/html|text/css|image/jpeg|image/gif)");

/* Supported File Suffixes and Corresponding Content-type */
var fileType = {js: 	"application/javascript",
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
        version: undefined,
        headers: new Object(), // Map of (header name : data)
        lastLine: undefined,
        moreRequests: true,
        error: false,
		body: true
    }
	
	/* Request Parser */
    var lines = request.toString().split("\n"); // create an array of the lines of the request
	
	// Parse initial line
	var InitialLine = lines[startLine].toString().split(/\s+/g);
	if(InitialLine.length != 4){ // Check number of argumants
	    req.error = {errorNum: 500, errorMes: "ERROR: cannot read initial request Line"};
		return req;
	}
	req.method = InitialLine[0]; // Get method
	if(!equalsIgnoreCase(req.method, "GET")){
		req.error = {errorNum:405, errorMes:"ERROR: not a GET request"};
		return req;
	}
	req.path = InitialLine.length == 4 ? InitialLine[1] : ""; // Get path
	req.version = patternVersion.test(InitialLine[2].toUpperCase()) ? patternVersion.exec(InitialLine[2].toUpperCase())[0] : ""; // Get http version
	if(req.method == "" || req.path == ""  || req.version == "" ){
	    req.error = {errorNum:500, errorMes:"ERROR: cannot read initial request Line"};
		return req;
	}
	// Parse Headers
	var i = startLine + 1;
    for ( ; i < lines.length && patternContent.test(lines[i]) ; ++i){
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
	var suffix = req.path.split(".").length == 1 ? "txt" : req.path.split(".")[1];
	if(req.headers["ACCEPT"] == undefined || req.headers["ACCEPT"] == ""){
			req.headers["ACCEPT"] = fileType[suffix];
	}
	req.headers["ACCEPT"] = pattrenGet.exec(req.headers["ACCEPT"].toLowerCase()) != null ? 
							pattrenGet.exec(req.headers["ACCEPT"].toLowerCase())[0] : "";
	try{
		if(!equalsIgnoreCase(fileType[suffix], req.headers["ACCEPT"]) && req.headers["ACCEPT"] != ""){
			req.error = {errorNum:500, errorMes:"ERROR: mismatch of content-type and requestes file"};
		}
	}
	catch(err){
		req.error = {errorNum:500, errorMes:"ERROR: cannot read requested file"};
	}
	var currLine = "";
    for(; i < lines.length && !equalsIgnoreCase(currLine[0], "GET") ; i++) { // Proceed to the following request (or end of data)
		currLine = request.toString().split(" ");
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

exports.requestParser = requestParser;
