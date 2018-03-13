$(function() {
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
	
	//initialize calculator value
	var total='';
	
	//function to convert local currency to digibyte
	var localToDGB=function(value) {
		var usd=value/fiatRates[config.currency];					//converts local to USD
		var dgb=Math.ceil(config.rate(usd)*1000000)/1000000;		//round to 6 digits precision in stores favor
		dgb+=Math.floor(Math.random()*100)/100000000				//add random 2 digits to end to make sure price is unique so easy to see when transaction complete
		return dgb;
	}
	
	//initialize payment qr code
	var qrcode=new QRCode(document.getElementById("pay_qr"),{
			text:	'digibyte:'+config.wallet,
			width:	200,
			height:	200,
			colorDark:	"#000000",
			colorLight:	"#ffffff",
			correctLevel:	QRCode.CorrectLevel.L
		});
		
	//handle payment window closing
	var closePayWindow=function(success) {
		//change whats shown
		$('#done').show();
		$('#pay').hide();
		
		//should X or check somewhere
		$("#done").html(success?"Received":"Failed");
		// *************************************************************************************************
		// *************************************************************************************************
		// *************************************************************************************************
		// *************************************************************************************************
		// *************************************************************************************************
		
	}
	
	var address,billLocal,billDGB;
	
	var tipChanged=function(local,dgb) {
		//generate qr code
		qrcode.clear();
		qrcode.makeCode('digibyte:'+address+'?amount='+dgb);
		
		//show human readable info
		$('#pay_local').html('$'+local.toFixed(2));
		$('#pay_exchange').html('$'+(local/dgb).toFixed(4)+'/DGB');
		$('#pay_dgb').html(dgb.toFixed(8)+' DGB');			
	}
		
		
	

	//listen for mouse clicks on calculator enter button
	var calcEnterPressed=function(local,dgb) {
		//see if using tips
		if (config["tip_wallet"]==false) {
			//no tip so don't need 3rd party server
			$('#calc').hide();		
			$('#pay').show();
			$('#pay_tip').hide();
		
			//save data and set tip to 0
			address=config["store_wallet"];
			billLocal=local;
			billDGB=dgb;
			tipChanged(billLocal,billDGB);	//show value assuming no tip
			
			
			
			//checks transactions
			var firstRun=true;
			var transactions=[];
			var findNewTransaction=function() {
				$.getJSON("https://digiexplorer.info/api/addr/"+address,function(checkData) {
					if (firstRun) {
						//ignore since we haven't asked for money yet
						transactions=checkData["transactions"];	
						firstRun=false;
					} else {
						//check all transactions and if new see if correct amount
						for (tx of checkData["transactions"]) {
							if (transactions.indexOf(tx)==-1) {
								
								//check if transaction amount correct
								$.getJSON("https://digiexplorer.info/api/tx/"+tx,function(checkData) {
									for (var vout of checkData["vout"]) {
										//find part of tx going to us and see if amount is correct
										if ((vout["scriptPubKey"]["addresses"][0]==address) && (vout["value"]==dgb)) {
											
											//mark as successful and go back to main window
											closePayWindow(true);
											
											//delete interval
											clearInterval(keepChecking);
										}
									}
								});
								
								
							}
						}
					}
				});						
			}
			
			//check if money sent
			var keepChecking=setInterval(findNewTransaction,15000);
			findNewTransaction();
			
		} else {
			//tip mode
				
			
			//swap what is showing
			$('#calc').hide();
			$('#wait').show();
			$('#pay_tip').show();

			
			//create transaction with server
			$.getJSON(config["server"]+"create.php?s="+config["store_wallet"]+"&t="+config["tip_wallet"]+"&a="+dgb,function(createData) {
			//swap what is showing
				$('#wait').hide();
				$('#pay').show();
			
				//save data and set tip to 0
				address=createData["a"];
				billLocal=local;
				billDGB=dgb;
				tipChanged(billLocal,billDGB);	//show value assuming no tip
				
				//show tip calculator
				var tipCalc=new DGBcalc({
					"canvas":	"pay_tip_calc",
					"tip":		local,
					"local":	config["currency"],
					"onChange":	tipChanged,
					"dgb":		config["rate"]
				});
				
				
				var keepChecking=setInterval(function() {
					$.getJSON(config["server"]+"check.php?w="+createData["w"],function(checkData) {
						if (checkData["w"]==createData["w"]) {	//should always but lets be safe
							if (checkData["e"]) {
								//mark as successful and go back to main window
								closePayWindow(true);
								
								//delete interval
								clearInterval(keepChecking);
							}
						}
					});		
				},15000);
			});
		}
	}
	var calc=new DGBcalc({
				"canvas":	"calc_canvas",
				"local":	config["currency"],
				"onSubmit":	calcEnterPressed,
				"dgb":		config["rate"]
			});
		
		
	
	//listen for clicks on cancel button
	$(document).on('click','#pay_cancel',function() {
		closePayWindow(false);
	});
	
	//listen for clicks on done page
	$(document).on('click','#done',function() {
		$("#done").hide();
		$("#calc").show();
	});
	

});		