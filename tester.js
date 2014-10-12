var net = require('net');
var http = require('http');
var miniExpress = require("./miniExpress");
var TESTS_NUMBER = 10;
var testRes = 0;
var passed = 0;
var PORT = 8080;
var app = miniExpress();

var description = {
	1: "sending legal request",
	2: "request unexisting file",
	3: "more than 3 arguments in initial line",
	4: "less than 3 arguments in initial line",
	5: "Illegal HTTP version",
	6: "Illegal parameter HTTP parameter",
	7: "not a GET method",
	8: "Illegal method parameter",
	9: "ignore multiple spaces",
	10: "send multiple requests at once"
};

var correctStatus = {
	1: 200,
	2: 404,
	3: 500,
	4: 500,
	5: 500,
	6: 500,
	7: 405,
	8: 405,
	9: 200,
	10: 200
};

var reqTest1 = {
	hostname: 'localhost',
	port: PORT,
	path: '/p/index.html',
  	method: 'GET',
	conection : 'Keep-Alive'
};

var reqTest2 = {
	hostname: 'localhost',
	port: PORT,
	path: '/p/no.html',
	method: 'GET',
	conection : 'Keep-Alive'
};

var reqTest = {
	3 : "GET /some/path HTTP/1.1 oneMoreArgumet\r\n\r\n",
	4 : "GET /some/path\r\n\r\n",
	5 : "GET /some/path HTTP/2.3\r\n\r\n",
	6 : "GET /some/path HTTP/1.1\notHttpVersion\r\n\r\n",
	7 : "POST /some/path HTTP/1.1\r\n\r\n",
	8 : "GETxxx /some/path HTTP/1.1\r\n\r\n",
	9 : "GET	   /p/index.html   	HTTP/1.1\r\n\r\n",
	10 : "GET /p/index.html HTTP/1.1\r\nconnection : Keep-Alive\r\n\r\n" +
				"GET /p/index.html HTTP/1.1\r\ncontent-length : 10\r\n\r\n" +
				"body\nbody\n\r\n\r\nGET /p/index.html HTTP/1.0\r\n\r\n"
}

function tests(){
	app.listen(PORT);
	app.use('/p', miniExpress.static(__dirname + '/www'));
	for(var testNum = 1; testNum <= TESTS_NUMBER ; testNum++){
		if(testNum == 1){
			runTest1(reqTest1, correctStatus[testNum], testNum);
		}
		else if(testNum == 2){
			runTest1(reqTest2, correctStatus[testNum], testNum);
		}
		else{
			runTest2(reqTest[testNum], correctStatus[testNum], testNum);
		}
	}
};

function runTest1(options, status, testNumber){
	var req = http.request(options, function(res){
		testRes++;
		console.log(">> Test number "+ testNumber + ", " + description[testNumber]);
		if (res.statusCode != status){
			console.log(">> Failed test number " + testNumber + ": expecting stauts: " + status + ", but got instead:", res.statusCode);
			conitnueTests = false;
		}
		else{
			console.log(">> Passed test number " + testNumber + ".");
			passed++;
		}
				if(testRes == TESTS_NUMBER){
			console.log(">> Score: " + Math.round(100*(passed/TESTS_NUMBER)) + "\/100");
			app.close();
		}
	});
	req.end();
}

function runTest2(requestToSend, status, testNumber){
	socket = net.createConnection(PORT);
	socket.on("data", function(data){
		testRes++;
		console.log(">> Test number "+ testNumber + ", " + description[testNumber]);
		initialLine = data.toString().split("\n")[0];
		resStatus = initialLine.split(" ")[1];
		if (resStatus != status){
			console.log(">> Failed test number " + testNumber + ": expecting stauts: " + status + ", but got instead:", resStatus);
			conitnueTests = false;
		}
		else{
			console.log(">> Passed test number " + testNumber + ".");
			passed++;
		}
		if(testRes == TESTS_NUMBER){
			console.log(">> Score: " + Math.round(100*(passed/TESTS_NUMBER)) + "\/100");
			app.close();
		}
	});
	socket.write(requestToSend);
}

tests();