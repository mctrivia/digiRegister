<?php
// ***************** FOR TESTING PURPOSE **** START
echo json_encode([
	"a"=>	$_GET['s'],		//send money to store
	"w"=>	"w1"			//fake wallet name
]);die();
// ***************** FOR TESTING PURPOSE **** END 

// *************Below is untested and will not run as long as testing code above is in


/*
expected get values.
	(s)tore
	(t)ip
	(a)mount

	
flow:
	insert users request into database(wants money sent to (s)tore and remainder sent to (t)ip.  Stores cut in DGB in (a)mount)
	create wallet with name			wID			where ID is the database id number_format
	return wallet name and wallet address to user.
*/






//connect to wallet
require "./database.php";
require "./digibyte.php";
$config = array(
    'user' => 'rpc-username',
    'pass' => 'rpc-password',
    'host' => '127.0.0.1',
    'port' => 'rpc-port' );
$dgb = new DGB( $config );


//get user entered info defaults to register tip wallet if none entered
$store="D9ssH7L8gLjkXrrEWJNWpuvdicvYwCkLh5";
$tip="D9ssH7L8gLjkXrrEWJNWpuvdicvYwCkLh5";
$amount=0;
if (isset($_GET['s'])) $store=$_GET['s'];
if (isset($_GET['t'])) $tip=$_GET['t'];
if (isset($_GET['a'])) $amount=$_GET['a'];


//insert into database and get id
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_DATA);
if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);
$sql='INSERT INTO `transactions`(`store`, `tip`, `amount`) VALUES (?,?,?)';
$stmtInsert=$conn->prepare($query);
$stmtInsert->bind_param('ssd',$store,$tip,$amount);
$stmtInsert->execute();
$wallet='w'.$conn->insert_id;


//create a wallet
$address = $dgb->get_address($wallet);

//return wallet to send money to
echo json_encode([
	"a"=>	$address,
	"w"=>	$wallet
]);