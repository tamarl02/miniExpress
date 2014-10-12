var net = require('net');
var http = require('http');
var miniExpress = require("./miniExpress");
var miniHttp = require("./miniHttp");
var TESTS_NUMBER = 10;
var testRes = 0;
var passed = 0;
var PORT = 8080;
var PORT2 = 8888;
var app = miniExpress();

var description = {
	1: "sending legal request",
	2: "request unexisting file",
	3: "more than 3 arguments in initial line",
	4: "less than 3 arguments in initial line",
	5: "Illegal HTTP version",
	6: "Illegal parameter HTTP parameter",
	7: "Empty path",
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
	7: 404,
	8: 405,
	9: 200,
	10: 200
};

var jsonData = JSON.stringify({'json':'data'});

var getTest1 = {
	hostname: 'localhost',
	port: PORT,
	path: '/p/index.html',
  	method: 'GET',
	conection : 'Keep-Alive'
};

var getTest2 = {
	hostname: 'localhost',
	port: PORT,
	path: '/p/no.html',
	method: 'GET',
	conection : 'Keep-Alive'
};

var postTest1 = {
    host: 'localhost',
    port: PORT2,
    path: '/yarden/tamar?someKey1=value1&someKey2=value2',
    method: 'POST',
    headers: { 
        'Content-Type': 'text/html',
        'Content-Length': jsonData.length,
        'Cookie':'chocolate=chips; brown=brownies'
    }
};

var getTest = {
	3 : "GET /some/path HTTP/1.1 oneMoreArgumet\r\n\r\n",
	4 : "GET /some/path\r\n\r\n",
	5 : "GET /some/path HTTP/2.3\r\n\r\n",
	6 : "GET /some/path HTTP/1.1\notHttpVersion\r\n\r\n",
	7 : "GET / HTTP/1.1\r\n\r\n",
	8 : "GETxxx /some/path HTTP/1.1\r\n\r\n",
	9 : "GET	   /p/index.html   	HTTP/1.1\r\n\r\n",
	10 : "GET /p/index.html HTTP/1.1\r\nconnection : Keep-Alive\r\n\r\n" +
				"GET /p/index.html HTTP/1.1\r\ncontent-length : 10\r\n\r\n" +
				"body\nbody\n\r\n\r\nGET /p/index.html HTTP/1.0\r\n\r\n"
}

function testStatic(){
	app.listen(PORT);
	app.use('/p', miniExpress.static(__dirname + '/www'));
	runTest1(getTest1, correctStatus[1], 1);
}

function runTest1(options, status, testNumber){
	var req = http.request(options, function(res){
		testRes++;
		console.log(">> Test number "+ testNumber + ", " + description[testNumber]);
		if (res.statusCode != status){
			console.log(">> Failed test number " + testNumber + ": expecting stauts: " + status + ", but got instead:", res.statusCode);
		}
		else{
			console.log(">> Passed test number " + testNumber + ".");
			passed++;
		}
		if(testNumber == 1){
			runTest1(getTest2, correctStatus[2], 2);
		}
		else if(testNumber == 2){
			runTest2(getTest[3], correctStatus[3], 3);
		}
	});
	req.end();
}

function runTest2(requestToSend, status, testNumber){
	socket = net.createConnection(PORT);
	socket.on("data", function(data){
		testRes++;
		initialLine = data.toString().split("\n")[0];
		resStatus = initialLine.split(" ")[1];
		if(/^\+?(0|[1-9]\d*)$/.test(resStatus)){
			console.log(">> Test number "+ testNumber + ", " + description[testNumber]);
			if (resStatus != status){
				console.log(">> Failed test number " + testNumber + ": expecting stauts: " + status + ", but got instead:", resStatus);
			}
			else{
				console.log(">> Passed test number " + testNumber + ".");
				passed++;
			}
			if(testNumber == TESTS_NUMBER){
				console.log("\n>> Score: " + Math.round(100*(passed/TESTS_NUMBER)) + "\/100");
				setTimeout(testDynamic, 3000);
				socket.end;
			}else if(testNumber < 10){
				runTest2(getTest[++testNumber], correctStatus[testNumber], testNumber);
			}
		}
	});
	socket.write(requestToSend);
}

function testDynamic(requestToSend, status, testNumber){
	console.log('\n>> Test dynamic abilities. ');
	var passedTests = 0;
    var app2 = miniExpress();
    app2.use(miniExpress.cookieParser());
    app2.post("/",miniExpress.json());
	app2.post("/yarden/:other",function(req, res){
	   	if(JSON.stringify(req.params).replace(" ", "") == "{\"0\":\"tamar\",\"other\":\"tamar\"}"){
	   		console.log("  * Passed params test");
	   		passedTests++;
	   	}
	   	else{
	   		console.log("  * Failed params test");
	   	}
	   	if(JSON.stringify(req.query).replace(" ", "") == "{\"someKey1\":\"value1\",\"someKey2\":\"value2\"}"){
	   		console.log("  * Passed query test");
	   		passedTests++;
	   	}
	   	else{
	   		console.log("  * Failed query test");
	   	}
	   	if(JSON.stringify(req.body).replace(" ", "") == "{\"json\":\"data\"}"){
	   		console.log("  * Passed body test");
	   		passedTests++;
	   	}
	   	else{
	   		console.log("  * Failed body test");
	   	}
	   	if(JSON.stringify(req.cookies).replace(" ", "") == "{\"chocolate\":\"chips\",\"brown\":\"brownies\"}"){
	   		console.log("  * Passed cookies test");
	   		passedTests++;
	   	}
	   	else{
	   		console.log("  * Failed cookies test");
	   	}
	   	if(req.path.trim() == "/yarden/tamar"){
	   		console.log("  * Passed path test");
	   		passedTests++;
	   	}
	   	else{
	   		console.log("  * Failed path test");
	   	}
	   	if(req.param("someKey1") == "value1"){
	   		console.log("  * Passed param() test");
	   		passedTests++;
	   	}
	   	else{
	   		console.log("  * Failed param() test");
	   	}
	   	if(req.is("text/plain")){
	   		console.log("  * Passed is() test");
	   		passedTests++;
	   	}
	   	else{
	   		console.log("  * Failed is() test");
	   	}

	    console.log("\n>> Testing response:");
	    res.set('Connection','Close');
	    if(res.get('Connection').toLowerCase() == 'close'){
	   		console.log("  * Passed set(key, val) test");
	   		passedTests++;
	   	}
	   	else{
	   		console.log("  * Failed set(key, val) test");
	   	}
	    res.set({'key':'val'});
	    if(res.get('key').toLowerCase() == 'val'){
	   		console.log("  * Passed set(JSON) test");
	   		passedTests++;
	   	}
	   	else{
	   		console.log("  * Failed set(JSON) test");
	   	}
	   	res.status(500);
	   	if( res.statusCode == 500){
	   		console.log("  * Passed status() test");
	   		passedTests++;
	   	}
	   	else{
	   		console.log("  * Failed status() test");
	   	}
	    console.log("\n>>>>>>>>>>> Dyanamic test score: " + (Math.round((passedTests/TESTS_NUMBER)*100)) + " <<<<<<<<<<<");
    });
    miniHttp.createServer(app2).listen(PORT2);  
    // Send post request
    var post_req = http.request(postTest1);
    // Write body
    post_req.write(jsonData);
}

testStatic()