//-----------------------------------//
//              Morph                //
//-----------------------------------//
//Requires main.js, element.js


var morph = function() { }

morph.transition = {
	linear:	function(c,l)	{	return (c/l);														},
	quadr:	function(c,l)	{	return ((c*c)/(l*l));												},
	sqrt:	function(c,l)	{	return ((Math.sqrt(c*10)/Math.sqrt(l*10)));							},
	x:		function(c,l)	{	return ((-Math.cos((c/l)*Math.PI)/2) + .5);							},
	y:		function(c,l)	{	return ((Math.pow((c/l)*1.0665, 3)-0.2*((c/l)*1.0665)));			},
	z:		function(c,l)	{	return ((Math.pow((c/l)*1.0665 -1, 3)-0.2*((c/l)*1.0665 -1)))+1;	},
	bounce:	function(c,l,r)	{	return 0.5-Math.cos(((r||2)-0.5)*(c/l)*2*Math.PI)/2;				}
};

morph.queue = {};
morph.queue.push = function(instance, position, queue) {
	this.inWork = false;
	if(!morph.queue[queue])	morph.queue[queue] = [];
	if(morph.queue[queue].length == 0) morph.queue[queue][0] = instance;
	else if(position == "end") morph.queue[queue].push(instance);
	else morph.queue[queue].splice(1,0,instance);
	if(morph.queue[queue].length == 1)	{
		instance.start();
	}
}
morph.queue.next = function(queue) {
	if(!morph.queue[queue]) return;
	if(morph.queue[queue].length == 1) { morph.queue[queue] = []; return; }
	else morph.queue[queue].splice(0,1);
	morph.queue[queue][0].start();
}

morph.prototype = {
	fireEvent: function(type) {
		if(this.options["on"+type]) this.options["on"+type].apply(this.element, [this]);
		if(this.events["on"+type]) {
			for(var k in this.events["on"+type].f)
				this.events["on"+type].f[k].apply(this.element, [this]);
		}
	},
	addEvent: function(type, f) {
		if(!this.events["on"+type]) this.events["on"+type] = {id:0,f:{}};
		this.events["on"+type].f[this.events["on"+type].id] = f;
		this.events["on"+type].id++;
		return [type, this.events["on"+type].id-1];
	},
	events: {},
	removeEvent: function(id) {
		if(!this.events["on"+id[0]]) return;
		delete this.events["on"+id[0]].f[id[1]];
	},
	add: function(element, cssString, options) {
		var element = this.element = $(element);
		options = this.options = this.setDefaultValues(options);
		this.cssString = cssString;
		// alle werte im vorhinein berechnen ? 
		this.counter = 0;
		this.max = options.duration / (options.quality / 1000);
		this.fireEvent("add");
		this.queue();
	},
	precache: function() {
		this.precacheValues = [];
		for(var k=0; k<this.max; k++) {
			this.precacheValues[k] = [];
			for(var i=0; i<this.format.format.length; i++) {
				var newValue = "";
				for(var j=0; j<this.format.format[i].length; j++) {
					var doParseFloat = this.defaultParseFloatUnit[this.format.unit[i][j]] ? true : false;
					newValue += this.format.format[i][j];
					if(typeof this.format.different[i][j] != "undefined") {
						var trans = this.options.transition(k,this.max,this.options.repeats);
						var numberValue = this.format.different[i][j] * trans;
						newValue += this.format.startValue[i][j] + (this.defaultParseFloat[this.format.attribut[i]] || doParseFloat==true ? parseFloat(numberValue) : parseInt(numberValue));
					}
				}
				this.precacheValues[k][i] = newValue;
			}
		}
	},
	start: function() {
		this.inWork = true;
		this.fireEvent("start");
		var newStyles = this.toObject(this.cssString);
		var oldStyles = this.getOldStyles(this.element, newStyles);
		this.format = this.toFormat(oldStyles, newStyles, this.element);
		if(this.options.precache) this.precache();
		var that = this;
		this._startTS = new Date().getTime();
		if(this.options.precache)
			this.interval = morph._interval.set(function() { that.updatePrecache(); }, this.options.quality);//window.setTimeout(function() {that.updatePrecache(); }, this.options.quality);//
		else
			this.interval = morph._interval.set(function() { that.update(); }, this.options.quality);
	},
	update: function() {
		this.fireEvent("update");
		this.counter++;
		if(this.counter > this.max)
			this.end(setEndValue=true,notByUser=true);
		else {
			for(var i=0; i<this.format.format.length; i++) {
				var newValue = "";
				for(var j=0; j<this.format.format[i].length; j++) {
					var doParseFloat = this.defaultParseFloatUnit[this.format.unit[i][j]] ? true : false;
					newValue += this.format.format[i][j];
					if(typeof this.format.different[i][j] != "undefined") {
						var trans = this.options.transition(this.counter,this.max,this.options.repeats);
						var numberValue = this.format.different[i][j] * trans;
						newValue += this.format.startValue[i][j] + (this.defaultParseFloat[this.format.attribut[i]] || doParseFloat==true ? parseFloat(numberValue) : parseInt(numberValue));
					}
				}
				this.element.style[this.format.attribut[i]] = newValue;
			}
		}
	},
	updatePrecache: function() {
		this.counter++;
		if(this.counter > this.max)
			this.end(setEndValue=true,notByUser=true);
		else {
			this.fireEvent("update");
			//var that = this;
			//window.setTimeout(function() {that.updatePrecache(); }, this.options.quality);
			if(this.precacheValues[this.counter]) {
				var l = this.precacheValues[this.counter].length;
				while(l--) {
					this.element.style[this.format.attribut[l]] = this.precacheValues[this.counter][l];
				}
				this.element.style[this.format.attribut[0]] = this.precacheValues[this.counter][0];
			}
		}
	},
	end: function() {
		if(typeof setEndValue != "undefined" && setEndValue == true) {
			for(var i=0; i<this.format.format.length; i++) {
				var newValue = "";
				for(var j=0; j<this.format.format[i].length; j++) {
					var doParseFloat = this.defaultParseFloatUnit[this.format.unit[i][j]] ? true : false;
					newValue += this.format.format[i][j];
					if(typeof this.format.different[i][j] != "undefined") {
						var numberValue = this.format.different[i][j];
						newValue += this.format.startValue[i][j] + (this.defaultParseFloat[this.format.attribut[i]] || doParseFloat==true ? parseFloat(numberValue) : parseInt(numberValue));
					}
				}
				this.element.style[this.format.attribut[i]] = newValue;
			}
		}
		this.fireEvent("end");
		this._hasEnded = true;
		if(typeof notByUser == "undefined") this.fireEvent("abort");
		morph._interval.clear(this.interval);
		morph.queue.next(this.options.queueList);
		this.inWork = false;
	},
	stop: function() {
		morph._interval.clear(this.interval);
	},
	resume: function() {
		if(!this._hasEnded) {
			var that = this;
			this.interval = morph._interval.set(function() { that.update(); }, this.options.quality);
		}
	},
	queue: function() {
		if(!this.options.queue) this.start();
		else
			morph.queue.push(this, this.options.queue, this.options.queueList);
	},
	toObject: function(cssString) {
		var obj = [];
		var row = cssString.split(";");
		for(var i=0; i<row.length; i++) {
			if(row[i]) {
				var kva = row[i].split(":");
				obj[i] = [];
				obj[i][0] = kva[0].replace(/\s/g, "").toJsSyntax();
				obj[i][1] = kva[1].replace(/(^\s+|\s+$)/g, "");
			}
		}
		return obj;
	},
	getOldStyles: function(element, newStyles) {
		var ret = [];
		for(var i=0; i<newStyles.length; i++) {
			ret[i] = [];
			ret[i][0] = newStyles[i][0];
			ret[i][1] = element.getStyle(ret[i][0]);
			if(typeof ret[i][1] == "undefined")
				ret[i][1] = this.defaultStyle[ret[i][0]] ? this.defaultStyle[ret[i][0]] : "0";
		}
		return ret;
	},
	toFormat: function(oldStyle, newStyle, element) {
		var values = {attribut:[], startValue:[], endValue:[], different:[],format:[],unit:[]};
		for(var i=0; i<oldStyle.length; i++) {
			//hex zu rgb !!!
			oldStyle[i][1] = this.hexToRgb(oldStyle[i][1].toString());
			newStyle[i][1] = this.hexToRgb(newStyle[i][1].toString());
			
			values.attribut[i] = oldStyle[i][0];
			values.startValue[i] = [];
			values.endValue[i] = [];
			values.different[i] = [];
			values.format[i] = [];
			values.unit[i] = [];
			//aufspalten zahl text
			
			var text = (" " + newStyle[i][1]).match(/[^0-9\.-]+/g); // damit immer zeichen zuerst
			text[0] = text[0].replace(/^\s/g, "");
			for(var j=0; j<text.length; j++) {
				values.format[i][j] = text[j];
			}
			
			var oldStyleMatch = (oldStyle[i][1].search(/[0-9]/g) != -1 ? oldStyle[i][1] : (this.defaultStyle[oldStyle[i][0]] ? this.defaultStyle[oldStyle[i][0]] : "0")).match(/[0-9\.-]+((.*?)(\s|$|,))?/g);
			var newStyleMatch = newStyle[i][1].match(/[0-9\.-]+((.*?)(\s|$|,))?/g);
			var len = oldStyleMatch.length < newStyleMatch.length ? newStyleMatch.length : oldStyleMatch.length;
			for(var j=0; j<len; j++) {
				if(!oldStyleMatch[j]) oldStyleMatch[j] = oldStyleMatch[0];
				if(!newStyleMatch[j]) newStyleMatch[j] = newStyleMatch[0];
				if(oldStyleMatch[j].match(/(px|em|pc|pt|cm|mm|in|%)/g)) {
					var oldUnit = oldStyleMatch[j].match(/[^0-9\.-]+/g)[0];
					var newUnit = newStyleMatch[j].match(/[^0-9\.-]+/g)[0];
					values.unit[i][j] = newUnit;
					if(oldUnit != newUnit) {
						var propo = this.getProportion(element, oldUnit, newUnit, oldStyle[i][0]);
						var newOldValue = (propo * parseFloat(oldStyleMatch[j])) + newUnit;
						oldStyleMatch[j] = newOldValue;
						element.style[oldStyle[i][0]] = newOldValue;
					}
				}
				var different = parseFloat(newStyleMatch[j]) - parseFloat(oldStyleMatch[j]);
				values.startValue[i][j] = parseFloat(oldStyleMatch[j]);
				values.endValue[i][j] = parseFloat(newStyleMatch[j]);
				values.different[i][j] = different;
			}
		}
		return values
	},
	getProportion: function(element, unit1, unit2, attribut) {
		if(unit1 == unit2) return 1;
		element = $(element);
		var dummyElement1 = new Element();
		var dummyElement2 = new Element();
		dummyElement1.css("position:relative; top:-12"+unit1+"; left:-12"+unit1+"; width:10"+unit1+";"); //position:absolute; 
		dummyElement2.css("position:relative; top:-12"+unit2+"; left:-12"+unit2+"; width:10"+unit2+";");

		element.parentNode.appendChild(dummyElement1);
		element.parentNode.appendChild(dummyElement2);
		if(attribut && attribut.search(/(font|line)/g) != -1 && (unit1 == "%" || unit2 == "%")) {
			// Jetzt bezieht sich % nicht auf die breite sondern auf font-size GEHT NET GANZ GUT
			if(unit2 == "%") {
				dummyElement1.innerHTML = "a";
				var ret = dummyElement2.offsetWidth / dummyElement1.offsetHeight;
			}
			else {
				dummyElement2.innerHTML = "a";
				var ret = dummyElement2.offsetHeight / dummyElement1.offsetWidth;
			}
		}
		else
			var ret = dummyElement1.offsetWidth / dummyElement2.offsetWidth;
		dummyElement1.destroy();
		dummyElement2.destroy();
		return ret;
	},
	hasToMutchProps: function(o){
		var c = 0;
		for(var k in c) { c++; if(c>=2) return false; }
		return true;
	},
	hexToRgb: function(str) {
		var ma = str.match(/#([a-zA-Z0-9]{6}|[a-zA-Z0-9]{3})/g);
		if(!ma) return str;
		for(var i=0; i<ma.length; i++) {
			var hex = ma[i];
			if(hex.length == 3) hex = hex.substr(1,1) + hex.substr(2,1) + hex.substr(2,1) + hex.substr(2,1) + hex.substr(3,1) + hex.substr(3,1);
			var rgb = [];
			for(var j=0; j<6; j=j+2) {
				rgb.push(parseInt(hex.substr(j+1,2), 16));
			}
			str = str.replace(ma[i], "rgb(" + rgb.join(",") + ")");
		}
		return str;
	},
	setDefaultValues: function(obj) {
		if(!obj) return this.defaultValues;
		for(var k in this.defaultValues) {
			if(typeof obj[k] == "undefined") obj[k] = this.defaultValues[k];
		}
		return obj
	},
	defaultValues: {
		duration: 1, // sec
		quality: 15, // 1 -> high n -> low
		transition: morph.transition.linear,
		queueList: "default",
		precache: false,
		repeats: 1
	},
	defaultParseFloat: {
		opacity: true,
		fontSize: true
	},
	defaultParseFloatUnit: {
		em:true,
		"%":true,
		pc:true
	},
	defaultStyle: {
		filter: "100"
	}
};

morph._interval = {
	counter: 0,
	set: function(f, t) {
		var flag = false;
		if(morph._interval.list[t]) {
			for(var k in morph._interval.list[t].funcs) {
				flag = true;
				break;
			}
		}
		if(morph._interval.list[t] && flag) 
			morph._interval.list[t].funcs[morph._interval.counter] = f;
		else {
			morph._interval.list[t] = {};
			morph._interval.list[t].funcs = {};
			morph._interval.list[t].funcs[morph._interval.counter] = f;
			morph._interval.list[t].interval = window.setInterval(function(){
				for(var k in morph._interval.list[t].funcs) {
					morph._interval.list[t].funcs[k]();
				}
			},t);
		}
		morph._interval.counter++;
		return [t,morph._interval.counter-1];
	},
	clear: function(a) {
		delete(morph._interval.list[a[0]].funcs[a[1]]);
		var flag=true;
		for(var k in morph._interval.list[a[0]].funcs) {
			if(morph._interval.list[a[0]].funcs[k] != false) { flag=false; break;}
		}
		if(flag === true) {
			window.clearInterval(morph._interval.list[a[0]].interval);
		}
	},
	list: {}
};

morph.init = function() {
	var morphObj = {};
	
	for(var k in window.morph.prototype)
		morphObj[k] = morph.prototype[k];
	
	return morphObj;
}

Element.prototype.morph = function(cssString, options) {
	var m = new morph();
	m.add(this, cssString, options);
	return m;
};


