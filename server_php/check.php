<?php
// ***************** FOR TESTING PURPOSE **** START
echo json_encode([
	"e"=>	false,				//always say never got money
	"w"=>	$_GET['w']			//return wallet id
]);die();
// ***************** FOR TESTING PURPOSE **** END 

// *************Below is untested and will not run as long as testing code above is in


/*
expected get values.
	(w)allet


flow:
	if marked executed in db then return true
	if not then check wallet for deposit greater then amount
		if not found return false
		if found execute transfer to store and remainder to tip then mark as executed(time stamp) in database and return true
*/


require "./database.php";

//get id
$id=0;
if (isset($_GET['w'])) $id=substr($_GET['w'],1);

//check if wallet has been executed
$executed=false;
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_DATA);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);
$sql='SELECT `executed` FROM `transactions` WHERE `id`=? LIMIT 1';
$stmt=$conn->prepare($query);
$stmt->bind_param('i',$id);
$stmt->bind_result($executed);
$stmt->execute();
$stmt->fetch();

//return info
echo json_encode([
	"w"=>'w'.$id,
	"e"=>$executed
]);