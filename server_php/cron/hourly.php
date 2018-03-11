<?php
// ***************** FOR TESTING PURPOSE **** START
die();
// ***************** FOR TESTING PURPOSE **** END 

// *************Below is untested and will not run as long as testing code above is in


/*
expected get values.
	null
	
flow:
	for each wallet with funds in it
		if db says not executed
			if enough funds(take into account possible partial transfer below) then execute and update database
			if not enough funds but has been 12h send to store and mark shortfall in db
		if db says executed
			send money to tips
			

*/