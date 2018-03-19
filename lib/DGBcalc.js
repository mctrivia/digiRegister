"use strict";
/*
	assumes coinRates is defined	<script src="https://digibytega.me/api/coin_history.js"></script>
		

*/
var DGBcalc=function(configChanges) {
	/*
		config:
				required:
			canvas:		id of canvas item to draw calculator on
			
				optional:
			tip:		amount service costs or undefined no tip functions
			onChange:	function(amountLocal,amountDGB) executed when number changes
			onSubmit:	function(amountLocal,amountDGB) executed when enter pressed
			local:		currency code(if omitted USD)
			dgb:		function(amountUSD) to convert to DGB
			
	
	
	
	*/

	//create variable me to allow for minification
	var me=this;
	
	//define defaults
	me.config={
		"tip":		false,
		"onChange":	function() {},
		"onSubmit":	function() {},
		"local":	"USD",
		"dgb":		function(amountUSD) {
						return amountUSD/Math.min(coinRates[0],Math.max(coinRates[168]['min'],coinRates[6]['max']*0.85,coinRates[72]['avg']*0.9));
					}		
	};
	
	//initialise value
	me.total="0";
	
	//error checking input
	if ((typeof configChanges!="objects") && (typeof configChanges["canvas"]!="string")) {
		throw "canvas is not optional";
	}
	
	//replace defaults with configChanges if any
	for (var key in configChanges) {
		me.config[key]=configChanges[key];
	}
	
	//tip mode config
	me.tipTypeOptions=["%","$","DGB"];
	me.tipTypeDecimals=[0,2,8];
	me.tipType=0;
	me.tipTypeString="%/$/DGB";
	
	
	//private variables
	me.canvas=document["getElementById"](me.config["canvas"]);
	me.nums=[7,8,9,4,5,6,1,2,3,"Clear",0,"Enter"];
	
	//handle modifications if tip mode
	me["tip"](me.config["tip"]);
	
	//draw canvas
	me.redraw();

	//watch for button click
	function keyPress(key) {
		//handle value updates
		if ((key>=0) && (key<10)) {
			me.total+=key;
		}
		if (key=="Clear") me.total="0";
		if (key==me.tipTypeString) me.tipType=(++me.tipType)%3;	//rotate selected type to the right
		me.redraw();
		
		
		//handle trigger events
		var local;
		if (me.tipMode) {
			var tip=me.total/Math.pow(10,me.tipTypeDecimals[me.tipType]);
			if (me.tipTypeOptions[me.tipType]=="%") tip*=(me.config["tip"]/100);		//if percent then multiply 1/100th of entered value by product price
			if (me.tipTypeOptions[me.tipType]=="DGB") tip/=me.convertDGB(1);
			local=me.config["tip"]+tip;
		} else {
			local=me.total/100;
		}
		var dgb=me.convertDGB(local);
		me.config[(key=="Enter")?"onSubmit":"onChange"](local,dgb);
	}
	me.canvas["addEventListener"]("click",function(e) {
		var x=e["offsetX"];
		var y=e["offsetY"];
		var top=1+me.yPerRow*me.fullRows
		if (y>top) {
			keyPress(me.nums[Math.floor((y-top)/me.yPerRow)*3+Math.floor((x-1)/me.xPerCol)]);
		}
	});
	me.canvas["addEventListener"]("mousemove",function(e) {
		var y=e["offsetY"];
		var top=1+me.yPerRow*me.fullRows
		me.canvas["style"]["cursor"]=(y>top)?"pointer":"default";
	});
	document.addEventListener("keydown",function(e) {
		var key=e["key"];
		if (key=="Delete") {
			keyPress("Clear");
		} else if (((key>=0) && (key<10)) || (key=="Enter")) {
			keyPress(key);
		}
	});

}
DGBcalc.prototype={
	"tip": function(value) {
		var me=this;
		
		//set new tip state
		me.config["tip"]=value;
		
		//set if tip mode
		me.tipMode=(me.config["tip"]!=false);
		
		//set number of rows
		me.fullRows=(me.tipMode)?3:2;
		
		//set bottom right squares value
		me.nums[11]=(me.tipMode)?me.tipTypeString:"Enter";						//change enter to %/$/DGB
		
	},
	convertDGB: function(valueLocal) {
		var me=this;
		var usd=valueLocal/fiatRates[me.config["local"]];					//converts local to USD
		return Math.ceil(100000000*me.config["dgb"](usd))/100000000;
	},
	redraw: function() {
		var me=this;
		
		//get ctx
		var ctx=me.canvas["getContext"]("2d");
		
		//set canvas internal size to css size
		me.canvas["width"]=me.canvas["offsetWidth"];
		me.canvas["height"]=me.canvas["offsetHeight"];
		var width=me.canvas["width"]-2;
		var height=me.canvas["height"]-2;
		
		
		//calculate calculator dimensions
		var rows=me.fullRows+4;
		me.yPerRow=height/rows;
		me.xPerCol=width/3;
		
		//draw horizontal lines
		ctx["strokeStyle"]="#000000";
		var yLast=1+me.yPerRow;
		for (var row=1;row<rows;row++) {
			ctx["moveTo"](1,yLast);
			ctx["lineTo"](width,yLast);
			yLast+=me.yPerRow;
		}
		
		//draw vertical lines
		yLast=1+me.fullRows*me.yPerRow;
		var xLast=1+me.xPerCol;
		for (var col=1;col<3;col++) {
			ctx["moveTo"](xLast,yLast);
			ctx["lineTo"](xLast,height);
			xLast+=me.xPerCol;			
		}
		ctx["rect"](1,1,width,height);
		ctx["stroke"]();
		
		//calculate font size for numbers
		ctx["font"]="normal normal normal 30px Arial";
		var fontSize=Math.min(30*(me.xPerCol-6)/ctx['measureText'](me.nums[11])["width"],me.yPerRow-6);
		ctx["font"]="normal normal normal "+fontSize+"px Arial";
		
		//draw numbers
		ctx["textAlign"]="center";
		ctx["textBaseline"]="middle";
		ctx["fillStyle"]="#000000";
		ctx["strokeStyle"]="#000000";
		for (var row=0;row<4;row++) {
			for (var col=0;col<3;col++) {
				var num=me.nums[row*3+col];
				var x=1+me.xPerCol*(0.5+col);
				var y=yLast+me.yPerRow*(0.5+row);
				ctx["fillText"](num,x,y);
				//ctx["strokeText"](num,x,y);
			}				
		}
		
		//compute label font
		ctx["font"]="normal normal normal 30px Arial";
		var fontSize=Math.min(30*(width-4)/ctx['measureText']("DGB: 000000.00000000")["width"],me.yPerRow-6);
		ctx["font"]="normal normal normal "+fontSize+"px Arial";
		
		
		//compute label width
		var longestLabel=(me.tipMode)?"Tip DGB:":"DGB:";	//local currency may be longer so check below
		var labelWidth=Math.max(ctx["measureText"](longestLabel)["width"],ctx["measureText"](me.config["local"]+":")["width"])+2;
		
		//draw label
		ctx["textAlign"]="right";
		var label=me.config["local"]+':';
		var x=1+labelWidth;
		var y=1+me.yPerRow/2;
		ctx["fillText"](label,x,y);
		label="DGB:";
		y+=me.yPerRow;
		ctx["fillText"](label,x,y);
		if (me.tipMode) {
			label="Tip "+me.tipTypeOptions[me.tipType]+":";
			y+=me.yPerRow;
			ctx["fillText"](label,x,y);
		}
		
		//draw current number
		ctx["textAlign"]="right";
		x=width-2;
		y=1+me.yPerRow/2;
		var value=(me.tipMode)?me.config["tip"]:me.total/100;
		label=value.toFixed(2);
		ctx["fillText"](label,x,y);
		y+=me.yPerRow;
		label=me.convertDGB(value).toFixed(8);
		ctx["fillText"](label,x,y);
		if (me.tipMode) {
			var decimals=me.tipTypeDecimals[me.tipType];
			label=(me.total/Math.pow(10,decimals)).toFixed(decimals);
			y+=me.yPerRow;
			ctx["fillText"](label,x,y);
		}
		
	}





}

//code for google minifier
DGBcalc.prototype["redraw"]=DGBcalc.prototype.redraw;