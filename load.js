var http = require("http"); 
var fs = require("fs"); 
var miniExpress = require("./miniExpress"); 

var PORT = 8888; 
var REQ_NUM = 10000;
var resNum = 0, passed = 0; 
var sockets = new Object();

var req = {
    hostname: 'localhost',
    port: PORT,
    path: '/index.html',
    method: 'GET',
    conection : 'Keep-Alive'
};

var indexHtml = fs.readFileSync("www\\index.html").toString(); 
var app = miniExpress(); 
app.use('',miniExpress.static('www')); 
app.listen(PORT);

for (var i = 0 ; i < REQ_NUM ; i++){ 
    sockets[i] = http.get(req, function(res) {
        var resStr = ""; 
        res.on('data', function (data) { 
            resStr += data; 
        });
        res.on('end',function() { 
            passed = (resStr === indexHtml) ? ++passed : passed;
            if (++resNum === REQ_NUM){ 
                console.log(">> Load test results:\n>> Got: " + passed + " responses out of: " + REQ_NUM + " requests."); 
                if (passed == REQ_NUM){
                    console.log(">> NAILED IT!");
                }
                else{
                    console.log(">>  :(");
                }
                setTimeout(function() { 
                    console.log("Closing server"); 
                    app.close(); 
                }, 100); 
            }
        }); 
    }); 
} 
