var config={
	"fee":				10000,												//fee to pay for transfers.  6034 is minimum
	"currency":			"CAD",												//currency code:  USD,AUD,BGN,BRL,CAD,CHF,CNY,CZK,DKK,EUR,GBP,HKD,HRK,HUF,IDR,ILS,INR,ISK,JPY,KRW,MXN,MYR,NOK,NZD,PHP,PLN,RON,RUB,SEK,SGD,THB,TRY,ZAR
	"store_wallet":		[													//comma separated list of wallets.  Will randomly pay to one of them.  If only 1 wallet then always pays that one
							"D9ssH7L8gLjkXrrEWJNWpuvdicvYwCkLh5"
						],
	"store_name":		"digiRegister Demo",
	"tip_style":		2,													//0 - no tip, 1 - single person, 2 - multi person
	"tip_wallet":		{
							"mctrivia":			"DRB8aAB25NUfLS6fjHbnLKQuPNXhASWnto",
							"DGB General Fund":	"DFVsFBiKuaL5HM9NWZgdHTQecLNit6tX5Y",
							"DGB Marketing Fund":"32io2n8tSPbK7HBNkcYehMyLRY6EJGfeUU",
							"DGB Dev Bounty Fund":"3CmhvoyjYkhKWYQLjrpwKbEoWtkiW9cWwX"		
						},
	"receipt_server":	false,					//function not yet writen   -   receipt server location or false
	"rate":				function(value) {
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