$(function() {
	var total='';
	var localToDGB=function(value) {
		var usd=value/fiatRates[config.currency];
		var dgb=Math.ceil(config.rate(usd)*1000000)/1000000;	//leaving 6 digits percision.  if need to can use last 2 to make transaction unique
		return dgb;
	}
	var qrcode=new QRCode(document.getElementById("pay_qr"),{
			text:	'digibyte:'+config.wallet,
			width:	300,
			height:	300,
			colorDark:	"#000000",
			colorLight:	"#ffffff",
			correctLevel:	QRCode.CorrectLevel.H
		});
	$(document).on('click','.calc_num',function() {	
		total+=this.id.substr(5);
		$("#calc_top").html((total/100).toFixed(2));
	});
	$(document).on('click','#calc_C',function() {
		total='';
		$("#calc_top").html('');
	});
	$(document).on('click','#calc_E',function() {
		var dgb=localToDGB(total/100);
		
		//generate qr code
		qrcode.clear();
		qrcode.makeCode('digibyte:'+config.wallet+'?amount='+dgb);
		
		//show human readable info
		$('#pay_local').html('$'+(total/100).toFixed(2));
		$('#pay_exchange').html('$'+(total/100/dgb).toFixed(4)+'/DGB');
		$('#pay_dgb').html(dgb.toFixed(6)+' DGB');
		
		//swap what is showing
		$('#calc').hide();
		$('#pay').show();
		
		/*
			At this point should wait for the transaction to go through then 
			show check mark for staff to know all is good or if cancel pressed show x		
		*/
	});
	$(document).on('click','#pay_cancel',function() {
		$('#calc').show();
		$('#pay').hide();
		//should add an X some where to show it failed.
	});
	

});		