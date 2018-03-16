var config={
	"mode":		1,
		/*
			0:	non tip mode.   User must pay exact amount in one payment.  Money transfered directly to wallet.
					Values Ignored:	server,tip_wallet
			1:	tip mode.		User(s) can pay any amount over asked for.  Money transfered to temporary wallet 
								then amount asked for sent to store remainder sent to tip wallet.
					Values Ignored:	server
			+2	server mode.	same as above but uses a server to process payments and catch any payments 
								that may have gone through afterwards.
		
		
		
		
		*/
	
	
	
	"fee":		10000,										//fee to pay for transfers.  5430 is minimum
	"server":	"https://digibytega.me/examples/server/",				//address of wallet server
	"currency":	"CAD",										//currency code:  USD,AUD,BGN,BRL,CAD,CHF,CNY,CZK,DKK,EUR,GBP,HKD,HRK,HUF,IDR,ILS,INR,ISK,JPY,KRW,MXN,MYR,NOK,NZD,PHP,PLN,RON,RUB,SEK,SGD,THB,TRY,ZAR
	"store_wallet":	"D9ssH7L8gLjkXrrEWJNWpuvdicvYwCkLh5",	//replace tips address with store wallet address
	"tip_wallet":	"DRB8aAB25NUfLS6fjHbnLKQuPNXhASWnto",
	"rate":function(value) {
		/*
		example smart rate calculation.
		Will pad rate to the best of the following:
			minimum value in last week
			85% of max value in last 24h
			90% of average value in last 3 days
		Will always be current price or less.
		
		rates={
			0:	current value,
			1:	{
					min: min value in last hour,
					avg: avg value in last hour,
					max: max value in last hour
				},
			6: {
					min: min value in last 6 hours,
					avg: avg value in last 6 hours,
					max: max value in last 6 hours
				},
			12: ...,
			24: ...,
			36: ...,
			48: ...,
			72: ...,
			96: ...,
			120: ...,
			144: ...,
			168: ...,
		}
		*/
		return value/Math.min(coinRates[0],Math.max(coinRates[168].min,coinRates[6].max*0.85,coinRates[72].avg*0.9));					
	}
};	