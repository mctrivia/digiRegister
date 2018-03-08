"use strict";
/*
	assumes coinRates is defined	<script src="https://digibytega.me/api/coin_history.js"></script>
		

*/

//var coinRates={"1":{"min":0.0457,"avg":0.0457,"max":0.0457},"6":{"min":0.0457,"avg":0.0457,"max":0.0457},"12":{"min":0.0457,"avg":0.0457,"max":0.0457},"24":{"min":0.0457,"avg":0.0457,"max":0.0457},"36":{"min":0.0457,"avg":0.0457,"max":0.0457},"48":{"min":0.0457,"avg":0.0457,"max":0.0457},"72":{"min":0.0341,"avg":0.0357,"max":0.0457},"96":{"min":0.0336,"avg":0.0356,"max":0.0457},"120":{"min":0.0335,"avg":0.0357,"max":0.0457},"144":{"min":0.0335,"avg":0.0361,"max":0.0457},"168":{"min":0.0335,"avg":0.0361,"max":0.0457},"0":0.0457};
//var fiatRates={"CAD":1.3};
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

	//convert local to DGB
	var convertDGB=function(valueLocal) {
		var usd=valueLocal/fiatRates[me.config["local"]];					//converts local to USD
		return Math.ceil(100000000*me.config["dgb"](usd))/100000000;
	}
	
	//private variables
	var canvas=document["getElementById"](me.config["canvas"]);
	var ctx=canvas["getContext"]("2d");
	var nums=[7,8,9,4,5,6,1,2,3,"Clear",0,"Enter"];
	var width,height,yPerRow,xPerCol,rows,fullRows;
	
	//draw canvas
	var redrawCanvas=function() {
		//set canvas internal size to css size
		canvas["width"]=canvas["offsetWidth"];
		canvas["height"]=canvas["offsetHeight"];
		width=canvas["width"]-2;
		height=canvas["height"]-2;
		
		
		//calculate calculator dimensions
		fullRows=2+((me.config["tip"]!=false)?1:0);
		rows=fullRows+4;
		yPerRow=height/rows;
		xPerCol=width/3;
		
		//draw horizontal lines
		ctx["strokeStyle"]="#000000";
		var yLast=1+yPerRow;
		for (var row=1;row<rows;row++) {
			ctx["moveTo"](1,yLast);
			ctx["lineTo"](width,yLast);
			yLast+=yPerRow;
		}
		
		//draw vertical lines
		yLast=1+fullRows*yPerRow;
		var xLast=1+xPerCol;
		for (var col=1;col<3;col++) {
			ctx["moveTo"](xLast,yLast);
			ctx["lineTo"](xLast,height);
			xLast+=xPerCol;			
		}
		ctx["rect"](1,1,width,height);
		ctx["stroke"]();
		
		//calculate font size for numbers
		ctx["font"]="normal normal normal 30px Arial";
		var fontSize=Math.min(30*(xPerCol-6)/ctx['measureText']("Enter")["width"],yPerRow-6);
		ctx["font"]="normal normal normal "+fontSize+"px Arial";
		
		//draw numbers
		ctx["textAlign"]="center";
		ctx["textBaseline"]="middle";
		ctx["fillStyle"]="#000000";
		ctx["strokeStyle"]="#000000";
		for (var row=0;row<4;row++) {
			for (var col=0;col<3;col++) {
				var num=nums[row*3+col];
				var x=1+xPerCol*(0.5+col);
				var y=yLast+yPerRow*(0.5+row);
				ctx["fillText"](num,x,y);
				//ctx["strokeText"](num,x,y);
			}				
		}
		
		//compute label font
		ctx["font"]="normal normal normal 30px Arial";
		var fontSize=Math.min(30*(width-4)/ctx['measureText']("DGB: 000000.00000000")["width"],yPerRow-6);
		ctx["font"]="normal normal normal "+fontSize+"px Arial";
		
		
		//compute label width
		var labelWidth=Math.max(ctx["measureText"]("DGB:")["width"],ctx["measureText"](me.config["local"]+":")["width"])+2;
		
		//draw label
		ctx["textAlign"]="right";
		var label=me.config["local"]+':';
		var x=1+labelWidth;
		var y=1+yPerRow/2;
		ctx["fillText"](label,x,y);
		//ctx["strokeText"](label,x,y);
		label="DGB:";
		y+=yPerRow;
		ctx["fillText"](label,x,y);
		//ctx["strokeText"](label,x,y);
		
		//draw current number
		ctx["textAlign"]="right";
		x=width-2;
		y=1+yPerRow/2;
		var value=me.total/100;
		label=value.toFixed(2);
		ctx["fillText"](label,x,y);
		//ctx["strokeText"](label,x,y);
		y+=yPerRow;
		label=convertDGB(value).toFixed(8);
		ctx["fillText"](label,x,y);
		//ctx["strokeText"](label,x,y);
		
	}
	redrawCanvas();

	//watch for button click
	function keyPress(key) {
		//handle value updates
		if ((key>=0) && (key<10)) {
			me.total+=key;
		}
		if (key=="Clear") me.total="0";
		redrawCanvas();
		
		//handle trigger events
		var local=me.total/100;
		var dgb=convertDGB(local);
		me.config[(key=="Enter")?"onSubmit":"onChange"](local,dgb);
	}
	canvas["addEventListener"]("click",function(e) {
		var x=e["offsetX"];
		var y=e["offsetY"];
		var top=1+yPerRow*fullRows
		if (y>top) {
			keyPress(nums[Math.floor((y-top)/yPerRow)*3+Math.floor((x-1)/xPerCol)]);
		}
	});
	canvas["addEventListener"]("mousemove",function(e) {
		var y=e["offsetY"];
		var top=1+yPerRow*fullRows
		canvas["style"]["cursor"]=(y>top)?"pointer":"default";
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






}