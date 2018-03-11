<?php
	session_start();
	
	//load all config files
	$files=glob(__DIR__.'/config/*.php');
	foreach ($files as $file) {
		require_once($file);
	}
	/*
	//check if trying to log in via facebook
	require_once(__DIR__."/Security.php");
	if (isset($_GET['code'])&&isset($_GET['state'])) {
		//login
		Security::facebookLogin();
		
		//remove code and state from url
		Security::SanitizeURL('code','state');
	}
	
	//check if trying to log in via regular means
	if (isset($_POST['email'])&&isset($_POST['pass'])&&isset($_POST['login'])) {
		Security::logIn($_REQUEST['email'],$_REQUEST['pass']);
		
		//remove code and state from url
		Security::SanitizeURL();//removes post values
	}
	*/