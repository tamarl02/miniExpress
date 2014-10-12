-----------------------------------------------------------------------------------------------------------------
                                             README                                             
-----------------------------------------------------------------------------------------------------------------

Dynamic web server on top of node.js - application server or middleware server.

We tried to find the best path between efficient and organized,
 when we chose in which way to divide the entire proccess into modules 
and what are the tasks each module will handle.

note:  ‘www’ is the root folder, contains a static web page used to test get requests.

-----------------------------------------------------------------------------------------------------------------

In order to implement an efficient server we used asyncronic coding. Using callback functions, event
handlers for actions on the sockets (recieving data, closing socket). 
We used regexes instead of many conditions, that helped us handle several optional cases and not to 
divide to parts and handle each option in a different place.
When an error occur, we immediately stop the handle of that request and return an informative 
response. That is in order to prevent unnecessary actions.

-----------------------------------------------------------------------------------------------------------------
                                            Execute the attack                                             
-----------------------------------------------------------------------------------------------------------------
In order to make sure that those functions will get executed, we added a line that deletes all the 
handlers from the queue. That will make sure that our bad function will be first in line to be used
and that no other handler may respond before ours to an incoming request. If we had simply add 
our function to the queue, there is a chance that other handlers will be called before ours, and if 
those handlers don't call "next()", it will not reach our function at all. Now all that's left is to 
send a single request with the URL /hello/hacker and the DOS will be done.

-----------------------------------------------------------------------------------------------------------------
                                            Avoiding DOS attacks                                            
-----------------------------------------------------------------------------------------------------------------

In order to avoid DOS attacks, in case we get lots of requests from a single user, 
we will identify this hacker by his IP or user ID and ignore his request in the future.
To handle callbacks functions that run heavy calculations in synchronous manner, 
or run an infinite loop we can support multi-core for managing parallelism in NodeJS.

Then, in order to make those functions executed I would connect to the server in the following way:

app.use(express.bodyParser());
