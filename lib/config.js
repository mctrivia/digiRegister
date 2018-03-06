var config={
	"currency":	"USD",									//currency code
	"wallet":	"D9ssH7L8gLjkXrrEWJNWpuvdicvYwCkLh5",	//replace tips address with store wallet address
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
		return value/Math.min(rates[0],Math.max(rates[168].min,rates[24].max*0.85,rates[72].avg*0.9));					
	}
};	