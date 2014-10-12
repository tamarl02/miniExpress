/* Loads the server and send concurrent requests */
var http = require("http");
var miniExpress = require("./miniExpress");
var totalNumOfRequest = 2000; // number of requests to send
var reqNum = 0;
var resNum = 0;
var timeout = 0;
var PORT = 8080;
var app = miniExpress();
app.listen(PORT);
app.use('/x', miniExpress.static(__dirname + '/www'));
     
load();

function load() {
	var startTime = new Date();
	console.log(">> Runs load function...");
	intervalId = setInterval(function(){
		if(reqNum < totalNumOfRequest){
			sendRequest();
		}
		if(reqNum == totalNumOfRequest && resNum == totalNumOfRequest)
		{
			console.log(">> In " + Math.round((new Date() - startTime)/1000) + "sec, " + 
						totalNumOfRequest + " requests successfully got a response.");
			clearInterval(intervalId);
			app.close();
		}
	}, timeout);
}

/* Sends a single HTTP request */
function sendRequest() {
	reqNum++;
	var options = {host: 'localhost',
		port: PORT,
		path: '/index.html',
		method: 'GET',
	};	
	var req = http.request(options,function(res){
		res.on('data',function(data){
			resNum++;		
		});
	});
	req.end();	
}
