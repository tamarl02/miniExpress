==================
====== Ex 3 ======
==================

Q1:
We think that the hardest part in this exercise was to understand conceptually how the whole thing
works. In which way to divide the entire proccess into modules and what are the tasks each module 
will handle. We tried to find the best path between efficient and organized.

Q2:
The most fun part was to hit the refresh button for the 1000000th time and to see ex2 loaded on 
the browser!

Q3:
In order to implement an efficient server we used asyncronic coding. Using callback functions, event
handlers for actions on the sockets (recieving data, closing socket). 
We used regexes instead of many conditions, that helped us handle several optional cases and not to 
divide to parts and handle each option in a different place.
When an error occur, we immediately stopp the handle of that request and return an informative 
response. That is in order to prevent unnecessary actions.