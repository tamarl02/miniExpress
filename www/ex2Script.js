/* ex2 - shows the ex1 home page until the input boxes contains "admin" and send button is pressed, 
   then hide the profile page and shows instead a calculator, also operates the calculator. */

$(document).ready(function() {
	$("#calcObj").hide(); 

	/* When send button, id="login", is pressed checks whether the input-box text+password contains 
	   the value 'admin', if so clears the homepage content and loads calculator instead. */
	$("#login").bind('click', function(){ 
		if ( $("#username").val() === "admin" && $("#passwors").val() === "admin") { 	
			$("#homePage").hide();
			$("#calcObj").show();
		} 
	});

	/* Bind event with the corresponding functionality. */
	$("#clear").bind('click', calculate.reset);
	$("#add").bind('click', calculate.addition);
	$("#multiply").bind('click', calculate.multiplication);
	$("#settings").bind('click', calculate.settings);
	$(".num").bind('click', function(){ 
	    $("#numberInput").val($("#numberInput").val() + this.value);
	});
	$("#numberInput").bind('keydown', validateNumber);
});

var calculate = new calculator();

/* Let's only digits, 0-9, to be written on input box. */
function validateNumber(e) {
	var key = e.which;
	var regex = /[0-9\b]|\./;
	key = String.fromCharCode( key );
	if (!regex.test(key)) {
		e.preventDefault();
	}
}

/* Calculator object */
function calculator(){
	var empty = '';
	var clearDefault = 0;
	var input = 0, output = 0;

	/* Adds the number inside input-box to value presented on screen. */
	this.addition = function(){
		if($("#numberInput").val() != empty){
			setVars();
			$("#result").val(input + output);
			output = parseInt(input + output);
		}
	}

	/* Multiply the number inside input-box to value presented on screen. */
	this.multiplication = function() {
		if($("#numberInput").val() != empty){
			setVars();
			$("#result").val(input * output);
			output = parseInt(input * output);
		}
	}

	/* Updates input and output values. */
	function setVars(){
		input = parseInt($("#numberInput").val());
		$("#result").val(output);
		$("#numberInput").val(empty);
	}

	/* Shows the default value on screen */
	this.reset = function() {
		$("#result").val(clearDefault);
		$("#numberInput").val(empty);
		output = clearDefault;
	}

	/* Shows a popup that let the user chage the default calculator value, 
	   when this value is invalid, show an error message. */
	this.settings = function() {
		var regex = /[0-9\b]|\./;
		var newDefault = prompt("Enter a new default value",newDefault);
		if (newDefault != null && regex.test(newDefault)){
			clearDefault = output = parseInt(newDefault);
			$("#result").val(newDefault);
		} else {
			alert("ERROR: Should enter a non-negative number.");   
		}
	}	
}





