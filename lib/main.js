//offline test 	var coinRates={"1":{"min":0.0268,"avg":0.0287,"max":0.0309},"6":{"min":0.0268,"avg":0.0289,"max":0.0309},"12":{"min":0.0268,"avg":0.0288,"max":0.0309},"24":{"min":0.0268,"avg":0.0296,"max":0.0336},"36":{"min":0.0268,"avg":0.0301,"max":0.0338},"48":{"min":0.0268,"avg":0.0307,"max":0.0361},"72":{"min":0.0268,"avg":0.032,"max":0.0376},"96":{"min":0.0268,"avg":0.0327,"max":0.0378},"120":{"min":0.0268,"avg":0.0332,"max":0.0378},"144":{"min":0.0268,"avg":0.0338,"max":0.0395},"168":{"min":0.0268,"avg":0.0341,"max":0.0395},"0":0.0276};
//offline test 	var fiatRates={"AUD":1.2811,"BGN":1.5746,"BRL":3.2414,"CAD":1.2917,"CHF":0.94445,"CNY":6.3357,"CZK":20.471,"DKK":5.9983,"EUR":0.80509,"GBP":0.72027,"HKD":7.838,"HRK":5.987,"HUF":251.2,"IDR":13779,"ILS":3.45,"INR":65.13,"ISK":99.428,"JPY":106.13,"KRW":1071.8,"MXN":18.693,"MYR":3.9065,"NOK":7.8202,"NZD":1.3769,"PHP":52.046,"PLN":3.3848,"RON":3.7507,"RUB":56.895,"SEK":8.2256,"SGD":1.3154,"THB":31.335,"TRY":3.8102,"USD":1,"ZAR":11.889};
//offline test 	var receiptServer="http://games.localhost.com:81/api/";
var receiptServer="https://digibytega.me/api/";
var mainSite=function(config) {
	
	//convert config["rate"] to function
	config["rate"]=new Function("usd",config["rate"]);
	
	console.log(config);
	
	//show page
	$(".page").hide();
	$("#s").show();
	
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
	if (config["store_id"]==false) {
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
		$('.page').hide();
		$('#s').show();
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
						var data=JSON.stringify({
							"ref":		$("#s_ref").val(),
							"local":	local,
							"dgb":		dgb
						});
						
						//generate temp wallet
						var digibyte=require('digibyte');
						var privateKey=new digibyte.PrivateKey();
						var tempWallet=privateKey.toAddress();
						tempWalletAddress=tempWallet.toString();
						
						//send job to receipt server and get receipt id
						var auth=sha256(config["store_pkey"]+config["store_id"]+tempWalletAddress+storeWalletAddress+data);
						$.getJSON(receiptServer+"receipt_add.php?auth="+auth+"&store="+config["store_id"]+"&from="+tempWalletAddress+"&to="+storeWalletAddress+"&data="+btoa(data),function(receiptData) {
							if (!receiptData["success"]) alert(receiptData["error"]);
						});
			
						//hide tip calculator if no tip mode
						if (tipWallets.length==0) {
							$('#c_tip').hide();			
						} else {
							$('#c_tip').show();				
						}
		
						//hide staff page and show client page
						$('.page').hide();		
						$('#c').show();
						
						//initialize tip calculator
						tipCalc["tip"](local);
						tipCalc["redraw"]();
						
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
									
									//get utxos
									$.getJSON("https://digiexplorer.info/api/addr/"+tempWalletAddress+"/utxo",function(utxos) {
							
										//initialize transaction
										var transaction=new digibyte.Transaction()
											.from(utxos)
											.change(digibyte.Address.fromString('D623LV8sRAqrh8H3bFtEkH4YZbeM41gH8i'));	//dust wallet.  goes towards maintenance costs
										
										//set all that need to get payed
										for (var to of toBePayed) {
											transaction.to(to[0],to[1])
										}
										
										//set max transaction cost.  If api calculates lower then remainder goes to dust wallet to help with server costs
										if (transaction.getFee()>toBePayed.length*config["fee"]) {
											transaction.fee(Math.floor(toBePayed.length*config["fee"]));
										}
										
										//sign transaction
										transaction.sign(privateKey);
										
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
												//show thank you page
												$(".page").hide();
												$("#p").show();
											},
											"error":		function() {
												//error handling.  Need to make better but works for now
												console.log("something want wrong private key to recover funds is: " + console.log(privateKey.toString()));
											},
										});
									});							
									
									
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
	
	//listen for clicks on thanks window
	$(document).on('click','#p',function() {
		closePayWindow(1);
	});
}



$(function() {
	$.getJSON('config.json').done(mainSite).fail(function() {
		//no config file found request it from server
		
		//get list of accepted currencies
		var options="";
		for (var code in fiatRates) {
			options+='<option value="'+code+'"'+((code=="USD")?' selected':'')+'>'+code+'</option>';
		}
		$("#r_local").html(options);
		
		//get list of accepted time frames
		var options="";
		for (var time in coinRates) {
			if (time!=0) {
				var timeText="";
				if (time<48) {
					timeText=time+" hours";
				} else {
					timeText=(time/24)+" days";
				}
				options+='<option value="'+time+'">'+timeText+'</option>';
			}
		}
		$(".r_rate_t").html(options);
		
		//select time frame defaults
		$("#r_rate_min_t option[value=168]").attr("selected","selected");
		$("#r_rate_max_t option[value=6]").attr("selected","selected");
		$("#r_rate_ave_t option[value=72]").attr("selected","selected");
		
		//show login/registration page
		$("#r").show();
		
		//watch tip add button
		var tipWallets={};
		$(document).on('click','#r_tip_add',function() {
			
			//load digibyte 
			var digibyte=require('digibyte');
			
			//remove any letters from name not allowed and see if already used
			var name=$("#r_tip_name").val().replace(/[^a-z0-9 ]/gi,'');
			if (typeof tipWallets[name]!="undefined") {
				alert("Name already used");
				return;
			}
			
			//validate wallet is possible
			var wallet=$("#r_tip_wallet").val();
			if (digibyte.Address.isValid(wallet)) {			
				//add wallet to variable
				tipWallets[name]=wallet;
				
				//add wallet to html
				var html='<br><table border="0">';
				for (var name in tipWallets) {
					html+='<tr><th>'+name+'</th><td>'+tipWallets[name]+'</td></tr>';
				}
				html+='</table>';
				$("#r_tips").html(html);
				
				//clear input field
				$("#r_tip_name").val('');
				$("#r_tip_wallet").val('');
			} else {
				alert("Wallet is invalid");
			}
		});
		
		//watch wallet add button
		var storeWallets=[];
		$(document).on('click','#r_wallet_add',function() {
			//load digibyte 
			var digibyte=require('digibyte');
			
			//validate wallet is possible
			var wallet=$("#r_wallet").val();
			if (digibyte.Address.isValid(wallet)) {			
				//add wallet to variable
				storeWallets.push(wallet);
				
				//add wallet to html
				var html='';
				for (var wallet of storeWallets) {
					html+='<br>'+wallet;
				}
				$("#r_wallets").html(html);
				
				//clear input field
				$("#r_wallet").val('');
			} else {
				alert("Wallet is invalid");
			}
		});
		
		//watch password updates
		$(document).on('change','.r_pwd',function() {
			console.log("change");
			$("#r_pwd_match").html(($("#r_pwd").val()==$("#r_pwd2").val())?"Match":"X");
		});
		
		//watch register button
		$(document).on('click','#r_register',function() {
			
			//check passwords match
			var fail=($("#r_pwd").val()!=$("#r_pwd2").val());	//fail if don't match
			
			//check functions
			var getValue=function(id) {
				//get requested value
				var temp=$("#"+id).val().trim();
				if (temp=="") {
					$("#"+id).css("backgroundColor","#FFDDDD");
					fail=true;
					return false;
				} 
				$("#"+id).css("backgroundColor","rgba(255,255,255,0)");
				return temp;
			}
			var getPercent=function(name) {
				return $("#r_rate_"+name+"_p").val()/100;
			}
			var getTime=function(name) {
				return $("#r_rate_"+name+"_t").val();
			}
			
			
			//check inputs are all filled in
			var sendData={
				"store_name":	getValue("r_store"),
				"currency":		getValue("r_local"),
				"store_wallet":	storeWallets,
				"tip_wallet":	tipWallets,
				"tip_style":	getValue("r_tip_style"),
				"rate":			"return usd/Math.min(coinRates[0]*"+getPercent("current")+",Math.max(coinRates["+getTime("min")+"].min*"+getPercent("min")+",coinRates["+getTime("max")+"].max*"+getPercent("max")+",coinRates["+getTime("ave")+"].avg*"+getPercent("ave")+"));",
			};
			sendData["password"]=sha256("digiRegister("+sendData["store_name"].toLowerCase()+"):"+getValue("r_pwd"));	//salt the password and hash before sending
			var checkWallet=function(name,sizeArray) {
				if (sizeArray.length==0) {
					$("#r_"+name+"_cell").css("backgroundColor","#FFDDDD");
					fail=false;
				} else {
					$("#r_"+name+"_cell").css("backgroundColor","rgba(255,255,255,0)");
				}
			}
			checkWallet("store",storeWallets);
			if (sendData["tip_style"]!=0) {	//no tip allowed in no tip mode
				checkWallet("tip",Object.keys(tipWallets));
			}
			
			//send to server
			if (!fail) {
				$.post(receiptServer+"receipt_register.php",sendData,function(config) {
					config=JSON.parse(config);
					if (config["success"]==false) {
						alert(config["error"]);
					} else {
						mainSite(config);
					}
				});
			}
		
		});
		
		//watch login button
		$(document).on('click','#l_login',function() {
			var fail=false;
			var getValue=function(id) {
				//get requested value
				var temp=$("#"+id).val().trim();
				if (temp=="") {
					$("#"+id).css("backgroundColor","#FFDDDD");
					fail=true;
					return false;
				} 
				$("#"+id).css("backgroundColor","rgba(255,255,255,0)");
				return temp;
			}
			
			//get needed data for login
			var sendData={
				"store_name":	getValue("l_store")
			}
			sendData["password"]=sha256("digiRegister("+sendData["store_name"].toLowerCase()+"):"+getValue("l_pwd"));	//salt the password and hash before sending
			
			//send to server
			if (!fail) {
				$.post(receiptServer+"receipt_login.php",sendData,function(config) {
					config=JSON.parse(config);
					if (config["success"]==false) {
						alert(config["error"]);
					} else {
						mainSite(config);
					}
				});
			}
		});
		
	});

});