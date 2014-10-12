----------------------------------------------------------------------------------------                                                                           README                                             
----------------------------------------------------------------------------------------

Dynamic web server on top of node.js - application server or middleware server.

*	The dynamic web server is able to process GET,POST,DELETE and PUT requests.
*	Provided a createServer(handler) method on the miniHttp module that return a  
	server object.
*	The server object expose the following functions: listen(port,callback) and 
	.on(‘close’,callback).
*	App object - [ var express = require(./miniExpress); var app = express(); ] this 
	object is actually a function that is designed to be consumed by the 
	miniHttp.createServer() method.
*	.use(resource,requestHandler) method - resource is the directory prefix of the 
	resource that you would like to handle requestHandler is a function that  
	receives 3 arguments, request, response and next.
*	In addition the miniExpress app object support the following function - .get(), 
	.post(), .put(), .delete(), .route(), miniExpress.static(rootFolder), 
	miniExpress.cookieParser(), miniExpress.json(), miniExpress.urlencoded() and 
	miniExpress.bodyParser().

We tried to find the best path between efficient and organized,
when we chose in which way to divide the entire process into modules 
and what are the tasks each module will handle.

----------------------------------------------------------------------------------------

In order to implement an efficient server we used asyncronic coding. Using callback 
functions, event handlers for actions on the sockets (receiving data, closing socket). 
We used regexes instead of many conditions, that helped us handle several optional cases 
and not to divide to parts and handle each option in a different place.
When an error occur, we immediately stop the handle of that request and return an 
informative response. That is in order to prevent unnecessary actions.
