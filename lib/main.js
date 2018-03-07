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
			width:	300,
			height:	300,
			colorDark:	"#000000",
			colorLight:	"#ffffff",
			correctLevel:	QRCode.CorrectLevel.H
		});
		
	//listen for mouse clicks on calculator number buttons
	var calcNumPressed=function(number) {
		total+=number;
		$("#calc_top").html((total/100).toFixed(2));
	}
	$(document).on('click','.calc_num',function() {	
		calcNumPressed(this.id.substr(5));
	});
	
	//listen for mouse clicks on calculator clear button
	var calcClearPressed=function() {
		total='';
		$("#calc_top").html('');
	}
	$(document).on('click','#calc_C',calcClearPressed);
	
	//listen for mouse clicks on calculator enter button
	var calcEnterPressed=function() {
		//get amount of digibyte to ask customer for
		var dgb=localToDGB(total/100);
		
		//generate qr code
		qrcode.clear();
		qrcode.makeCode('digibyte:'+config.wallet+'?amount='+dgb);
		
		//show human readable info
		$('#pay_local').html('$'+(total/100).toFixed(2));
		$('#pay_exchange').html('$'+(total/100/dgb).toFixed(4)+'/DGB');
		$('#pay_dgb').html(dgb.toFixed(8)+' DGB');
		
		//swap what is showing
		$('#calc').hide();
		$('#pay').show();
		
		/*
			At this point should wait for the transaction to go through then 
			show check mark for staff to know all is good or if cancel pressed show x		
		*/
		
	}
	$(document).on('click','#calc_E',calcEnterPressed);
	
	//listen to keyboard keys
	$(document).on("keypress",function(e) {
		var key=e.key;
		if ((key>=0)&&(key<10)) {
			calcNumPressed(key);		//number was pressed
		} else if (key=="Enter") {
			calcEnterPressed();			//enter was pressed
		}
	});
	
	//listen for clicks on cancel button
	$(document).on('click','#pay_cancel',function() {
		$('#calc').show();
		$('#pay').hide();
		//should add an X some where to show it failed.
	});
	

});		