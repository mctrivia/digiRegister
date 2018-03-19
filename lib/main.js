//offline test 		var coinRates={"1":{"min":0.0268,"avg":0.0287,"max":0.0309},"6":{"min":0.0268,"avg":0.0289,"max":0.0309},"12":{"min":0.0268,"avg":0.0288,"max":0.0309},"24":{"min":0.0268,"avg":0.0296,"max":0.0336},"36":{"min":0.0268,"avg":0.0301,"max":0.0338},"48":{"min":0.0268,"avg":0.0307,"max":0.0361},"72":{"min":0.0268,"avg":0.032,"max":0.0376},"96":{"min":0.0268,"avg":0.0327,"max":0.0378},"120":{"min":0.0268,"avg":0.0332,"max":0.0378},"144":{"min":0.0268,"avg":0.0338,"max":0.0395},"168":{"min":0.0268,"avg":0.0341,"max":0.0395},"0":0.0276};
//offline test 		var fiatRates={"AUD":1.2811,"BGN":1.5746,"BRL":3.2414,"CAD":1.2917,"CHF":0.94445,"CNY":6.3357,"CZK":20.471,"DKK":5.9983,"EUR":0.80509,"GBP":0.72027,"HKD":7.838,"HRK":5.987,"HUF":251.2,"IDR":13779,"ILS":3.45,"INR":65.13,"ISK":99.428,"JPY":106.13,"KRW":1071.8,"MXN":18.693,"MYR":3.9065,"NOK":7.8202,"NZD":1.3769,"PHP":52.046,"PLN":3.3848,"RON":3.7507,"RUB":56.895,"SEK":8.2256,"SGD":1.3154,"THB":31.335,"TRY":3.8102,"ZAR":11.889};



$(function() {
	
	/* *****************************
	*        Initialization        *
	***************************** */
	var colors=["#FFAAAA","#AAFFAA"];
	$("#s").css("backgroundColor",colors[1]);
	
	//update crypto exchange rates every 5min
	setInterval(function() {
		$.getJSON('https://digibytega.me/api/coin_history.json',function(data) {
			coinRates=data;
		});		
	},300000);	//300,000 ms=5min
	
	//update fiat exchange rate every 120min
	setInterval(function() {
		$.getJSON('https://digibytega.me/api/fiat_rates.json',function(data) {
			fiatRates=data;
		});
	},7200000);	//7,200,000 ms=2hours
	
	//pick a store wallet to use
	var storeWalletAddress;
	var pickStoreWallet=function() {
		//pick a store wallet to use
		var options=config["store_wallet"];
		storeWalletAddress=options[Math.floor(Math.random()*options.length)];
		
		
	}
	pickStoreWallet();
	
	//initialize variable to find top of calculator
	var calcTop=$("#s_title").offset().top+$("#s_title").outerHeight(true);
	
	//put store name on staff page
	$("#s_title").html(config["store_name"]+" Staff Page");

	//if receipt server disable then hide #s_bill
	if (config["receipt_server"]==false) {
		$("#s_bill").hide();						//hide
	} else {
		calcTop+=$("#s_bill").outerHeight(true);	//add height to calculator top
	}
	
	//setup tip div
	var tipWallets=[];
	var multFlag=" multiple";
	var noneLine="";
	switch (config["tip_style"]) {
		case 0:	//tip mode disabled
			$("#s_tip").hide();
			break;
		case 1:	//single tip mode
			multFlag="";
			noneLine='<option value="NONE">None</option>';
		case 2:	//multiple tip mode
			var selectInput='<select'+multFlag+' id="s_options">'+noneLine;
			for (var name in config["tip_wallet"]) {
				selectInput+='<option value="'+config["tip_wallet"][name]+'">'+name+'</option>';
			}			
			selectInput+="</select>";
			$("#s_tip").append(selectInput);
			
			//add height to calculator top
			calcTop+=$("#s_tip").outerHeight(true);
	}
	
	//set s_ammount div to take up remainder of space
	$("#s_ammount").css("top",calcTop);
	
	//close customer window function
	var closePayWindow=function(success) {
		//set background color
		$("#s").css("backgroundColor",colors[success]);
		
		//change whats shown
		$('#s').show();
		$('#p').hide();
		$('#c').hide();
	}
	
	//bar code generator
	var expectedAmount;
	var tempWalletAddress;
	var qrcode=new QRCode(document.getElementById("c_qr"),{
			text:	'digibyte:'+storeWalletAddress,
			width:	200,
			height:	200,
			colorDark:	"#000000",
			colorLight:	"#ffffff",
			correctLevel:	QRCode.CorrectLevel.L
		});
	var tipChanged=function(local,dgb) {
		//generate qr code
		qrcode.clear();
		qrcode.makeCode('digibyte:'+tempWalletAddress+'?amount='+dgb);
		
		//show human readable info
		$('#c_local').html('$'+local.toFixed(2));
		$('#c_exchange').html('$'+(local/dgb).toFixed(4)+'/DGB');
		$('#c_dgb').html(dgb.toFixed(8)+' DGB');			
	}
	
	//setup tip calculator
	var tipCalc=new DGBcalc({
		"canvas":	"c_tip_calc",
		"local":	config["currency"],
		"onChange":	tipChanged,
		"tip":		0,
		"dgb":		config["rate"]		
	});
	
	//monitor tip wallet state
	var updateWallet=function() {
		var value=$("#s_options").val()||"NONE";
		if (config["tip_style"]==2) {
			tipWallets=value;			//multi select wallet
		} else if(value=="NONE") {
			tipWallets=[];				//none selected
		} else {
			tipWallets=[value];			//single select wallet
		}
	}
	$(document).on("change","#s_options",updateWallet);
	updateWallet();
	
	
	//setup staff calculator
	new DGBcalc({
		"canvas":	"s_calc",
		"local":	config["currency"],
		"onSubmit":	function(local,dgb) {
						//hide tip calculator if no tip mode
						if (tipWallets.length==0) {
							$('#c_tip').hide();			
						} else {
							$('#c_tip').show();				
						}
		
						//hide staff page and show client page
						$('#s').hide();		
						$('#c').show();
						
						//initialize tip calculator
						tipCalc["tip"](local);
						tipCalc["redraw"]();
						
						//generate temp wallet
						var digibyte=require('digibyte');
						var privateKey=new digibyte.PrivateKey();
						var tempWallet=privateKey.toAddress();
						tempWalletAddress=tempWallet.toString();
						
						//initialize with tip of 0
						expectedAmount=dgb;
						
						//generate bar code
						tipChanged(local,dgb);
			
						//watch temp wallet for payment
						var keepChecking=setInterval(function() {
							$.getJSON("https://digiexplorer.info/api/addr/"+tempWalletAddress,function(checkData) {
								var balance=checkData["balance"];
								
								if (balance>=expectedAmount) {									
									//delete interval
									clearInterval(keepChecking);
									
									//show processing window
									$("#c").hide();
									$("#p").show();
									$("#p_percent").html("0");
									
									//convert units to shatoa
									balance=Math.round(balance*100000000);
									dgb=Math.round(dgb*100000000);
									
									//calculate tip and store amount
									var tipAmount=0;
									if (tipWallets.length==0) {
										dgb=balance;	//pay everything to store
									} else {
										tipAmount=Math.floor((balance-dgb)/tipWallets.length);										
									}
									
									//generate list of those that need to be payed and how much
									var toBePayed=[];	//format [wallet,dgb-fee]
									toBePayed.push([digibyte.Address.fromString(storeWalletAddress),dgb-config["fee"]]);
									
									//as long as tip is greater then fee send everyone there tip.  sends dust to maintenance wallet
									if (tipAmount>config["fee"]) {
										for (var tipWallet of tipWallets) {
											toBePayed.push([digibyte.Address.fromString(tipWallet),tipAmount-config["fee"]]);
										}
									}
									
									//function to wait for steps to finish
									var waitForNext=function() {
										//see if done
										if (toBePayedKey==toBePayed.length) {
											//mark as successful and go back to main window
											closePayWindow(1);
										} else {
											//check if balance has changed
											var waitInterval=setInterval(function() {
												$.getJSON("https://digiexplorer.info/api/addr/"+tempWalletAddress,function(checkData) {
													if (balance!=checkData["balance"]) {
														balance=checkData["balance"];	//update current balance
														clearInterval(waitInterval);	//stop interval from checking
														payNext();						//pay next wallet
													}
												});
											},15000);
										}
									}

									//process payments
									var toBePayedKey=0;
									var payNext=function() {
										
										//get utxos
										$.getJSON("https://digiexplorer.info/api/addr/"+tempWalletAddress+"/utxo",function(utxos) {
								
											//calculate transaction
											var to=toBePayed[toBePayedKey][0];																							//who to send to
											var amount=toBePayed[toBePayedKey][1];																						//how many shatoshi to send
											toBePayedKey++;																												//advance key index so next time around we will send next. do now so when check if last it will equal array size
											var change=(toBePayedKey==toBePayed.length)?digibyte.Address.fromString('D623LV8sRAqrh8H3bFtEkH4YZbeM41gH8i'):tempWallet;	//if last transaction send change if any to digiRegister Maintenance wallet otherwise send back to temp wallet.  Collects rounding errors and 1 extra mining fee if tip is used.  Makes cost to customer easy.  Eactly 1 fee amount taken per transaction(i.e. store+3 tips=4*fee)
											var transaction=new digibyte.Transaction()
												.from(utxos)
												.to(to,amount)
												.change(change)
												.fee(Math.floor(config["fee"]*0.9))
												.sign(privateKey);
											
											//make transaction
											$.ajax({
												"type":			"POST",
												"url":			"https://digiexplorer.info/api/tx/send",
												"crossDomain":	true,
												"contentType":	"application/json",
												"data":			JSON.stringify({
													"rawtx":	transaction.serialize(),									
												}),
												"success":		function() {
													//show progress
													$("#p_percent").html(Math.round(100*toBePayedKey/toBePayed.length));
													
													//try next
													waitForNext()
												},
												"error":		function() {
													console.log("error will try again");
													setTimeout(function() {
														toBePayedKey--;
														payNext();
													},5000);
												},
											});
										});							
										
									};
									payNext();	//make first payment in chain
								}
								
							});	
							
						},15000);
			
			
					},
		"dgb":		config["rate"]
	});
	
	//listen for clicks on cancel button
	$(document).on('click','#c_cancel',function() {
		closePayWindow(0);
	});
});


/*

	
	//initialize calculator value
	var total='';
	
	//function to convert local currency to digibyte
	var localToDGB=function(value) {
		var usd=value/fiatRates[config.currency];					//converts local to USD
		var dgb=Math.ceil(config.rate(usd)*1000000)/1000000;		//round to 6 digits precision in stores favor
		dgb+=Math.floor(Math.random()*100)/100000000				//add random 2 digits to end to make sure price is unique so easy to see when transaction complete
		return dgb;
	}
	

});		
*/