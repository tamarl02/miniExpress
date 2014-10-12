/* Import Node Modules */
var net = require("net");
var url = require("url");
var fs = require("fs");
var pathModule = require("path");

/* Import Our Modules */
var miniHttp = require("./miniHttp");

function miniExpress(){
	/* miniExpress Object */
    var server;
    var queue = []; // Queue of handlers
    var routes = {get: [], post: [], delete: [], put: []}; // Handlers organized by method
    var app = function(req, res){
        miniExpress.callNext(req, res, queue, 0)();
    };
    app.use = function(path, func){
        var source = (arguments.length == 1) ? "/" : path;
        var useObject = new useObj("USE", source, (arguments.length == 1) ? path : func);
        queue.push(useObject);
        routes.get[routes.get.length] = useObject;
    };
    app.listen = function(port, func){
        server = miniHttp.createServer(app);
        if(port == undefined){
            port = 80;
        }
        server.listen(port, func);
    };
    app.close = function(callback){
        if(server != undefined){
       	    server.close(callback);
       	}
    };
    app.get = function(path, func){
        var source = (arguments.length == 1) ? "/" : path;
        var getObj = new useObj("GET", source, (arguments.length == 1) ? path : func);
        queue.push(getObj);
        routes.get[routes.get.length] = getObj;
    };
    app.post = function(path, func){
        var source = (arguments.length == 1) ? "/" : path;
        var postObj = new useObj("POST", source, (arguments.length == 1) ? path : func);
        queue.push(postObj);
        routes.post[routes.post.length] = postObj;
    };
    app.delete = function(path, func){
        var source = (arguments.length == 1) ? "/" : path;
        var deleteObj = new useObj("DELETE", source, (arguments.length == 1) ? path : func);
        queue.push(deleteObj);
        routes.delete[routes.delete.length] = deleteObj;
    };
    app.put = function(path, func){
        var source = (arguments.length == 1) ? "/" : path;
        var putObj = new useObj("PUT", source, (arguments.length == 1) ? path : func);
        queue.push(putObj);
        routes.put[routes.put.length] = putObj;
    };
    return app;
}

// Defines next() function
miniExpress.callNext = function(req, res, queue, i) {
    return function next(){
        if (i == queue.length){
            res.send(404);
            return;
        }
        if((queue[i].method == req.method || queue[i].method == "USE") && matchResource(req, queue[i].path)){
            req.rootSource = queue[i].path;
            try{
                queue[i].callback(req, res, miniExpress.callNext(req, res, queue, ++i)); // Calls the next handler in the queue
            }catch(e){
                res.send(500);
            }
        }else{
            miniExpress.callNext(req, res, queue, ++i)();
        }
    }
}

/* Handlers */
miniExpress.static = function(rootFolder){ // Static Request
    return function(req, res, next){
	    if(req.error != false){ // Got an error that occured in the request
	        res.set("content-length", req.error["errorMes"].length);
            res.send(req.error["errorNum"], req.error["errorMes"]);
        }
	    else {
	    	var folder = pathModule.join(rootFolder, req.path.substr(req.path.indexOf(req.rootSource)+ req.rootSource.length));
            fs.stat(folder, function(err,stat){
                if (err){ // Resource was not found
                    res.set("content-length", 42);
                    res.send(404, "ERROR: Cannot find the requested resource.");
                }
                else {
                    try {
                        // Return the requested file
                        if(stat.isFile()) {
                            if (req.headers["ACCEPT"] != undefined) {
                                var fileAsStream = fs.createReadStream(folder);
                                fileAsStream.on('error', function(err) {
                                    res.socket.end();
                                });
                                res.status(200);
                                res.set("content-length", stat.size);
                                res.set("content-type", req.headers["ACCEPT"]);
                                res.send(res.statusCode);
                                fileAsStream.pipe(res.socket, {end:false});
                            }
                            else {
                                res.set("content-length", 59);
                                res.send(500, "ERROR: The server lacks the ability to fulfill the request.");
                            }
                        }
                        else {// stats is not a File.
                            next();
                        }
                    } 
                    catch (err) {
                        res.status(500);
                        res.body = "ERROR: Cannot find the requested resource.";
                        res.headers["content-length"] = res.body.length;
                        res.send(res.statusCode);
                    }
                }
    		});		
	    }
	}
}

miniExpress.cookieParser =  function(){
    return function(req, res, next){
    	req.cookies = new Object();
    	if (req.get("cookie") != undefined) {
    		cookiesArr = req.get("cookie").split(";");
    		for(i = 0 ; i < cookiesArr.length ; i++){
    			var singleCookie = cookiesArr[i].split("=");
    			if (singleCookie.length == 2) {
    				req.cookies[singleCookie[0].trim()] = singleCookie[1].trim();
    			}
    		}
    	}
        next();
    }
}
 
miniExpress.json = function(){
    return function(req, res, next){
        try{
            var parseBody = JSON.parse(req.bodyStr);
            req.body = parseBody;
            next();
        }catch(e){}
    }
}

miniExpress.urlencoded = function(){
    return function(req, res, next){
    	req.body = new Object();
    	try{
            if ((req.get('Content-Type') != undefined) && (req.get('Content-Type').toLowerCase().match("application/x-www-form-urlencoded") != null)){
        		var params = req.bodyStr.split("&");
        		for(i = 0 ; i < params.length ; i++){
        			var singleParam = params[i].split("=");
        			if (singleParam.length == 2) {
        				req.body[singleParam[0].trim()] = singleParam[1].trim();
        			}
        		}
                next();
            }
        }catch(e){}
    }
}

miniExpress.bodyParser =  function(){
    return function(req, res, next){
        if(req.bodyStr == ""){
            next();
        }
        else{ // Try to execute one of the handlers
    	    miniExpress.urlencoded()(req,res, next);
            miniExpress.json()(req,res, next);
        }
    }
}

// Private function that builds regex from the rootsource and get params of the request path according to it
function matchResource(req, rootsource) {
	var regex = '^';
	var paramName = [];
	var currParam = 0;
	var params = {};
	for(var i = 0; (i < rootsource.length) && (i != -1); i++){
		if(rootsource[i] == ':'){
			regex += "(.+)";
			var tempI = (rootsource.substring(i).indexOf('/') == -1) ? rootsource.length : i + rootsource.substring(i).indexOf('/')-1;
			paramName[currParam++] = rootsource.substring(i + 1, tempI + 1);
			i = tempI;
		}
		else{
			regex += rootsource[i];
		}
	}
	var pattern = new RegExp(regex);
	var paramsValue = pattern.exec(req.path);

	if (paramsValue != null) {
		for(var i = 0 ; i < currParam ; i++) {
			params[paramName[i].trim()] = paramsValue[i + 1].trim();
			params[i] = paramsValue[i + 1].trim();
		}
		req.params = params;
		return true;	
	}
	return false;
}

// Object that is used as nodes of the queue
function useObj(objMethod, objPath, objFunc){
    this.method = objMethod;
    this.path = objPath;
    this.callback = objFunc;
}

module.exports = miniExpress;
