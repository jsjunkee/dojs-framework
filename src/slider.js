//-----------------------------------//
//              Slider               //
//-----------------------------------//
//Requires main.js, drag.js

function slider(e, opt) {
	this.opt = this.setDefaultOpt(opt);
	this.setEvent(opt);
	
	var slider = document.createElement("div");
	slider.className = opt.sliderClassName;
	if(opt.sliderStyle) {
		var s = opt.sliderStyle.split(";");
		for(var i=0; i<s.length; i++) {
			var k = s[i].split(":");
			if(k[0] != "")
				slider.style[(k[0]).replace(/\s/g,"")] = k[1];
		}
	}
	
	this.slider = slider;
	e.appendChild(slider);
	
	this.handle = [];
	this._dragelements = [];
	for(var i=this.opt.handles-1; i>=0; i--) {
		var handle =document.createElement("div");
		handle.className = this.opt.handleClassName;
		handle._num = i;
		if(opt.handleStyle) {
			if(typeof opt.handleStyle == "string")
				var s = opt.handleStyle.split(";");
			else
				var s = opt.handleStyle[i].split(";");
			for(var j=0; j<s.length; j++) {
				var k = s[j].split(":");
				if([k][0] != "")
					handle.style[k[0].replace(/\s/g, "")] = k[1];
			}
		}
		slider.appendChild(handle);
		handle.indexPos = this.handle.length;
		this.handle[i] = handle;
		var deopt = {toBody:true};
		if(this.opt.direction == "horizontal") {
			deopt.yAxis = false;
			deopt.ignoreBordersY = true;
		}
		else if(this.opt.direction == "vertical") {
			deopt.xAxis = false;
			deopt.ignoreBordersX = true;
		}
		if(this.opt.steps) {
			if(typeof this.opt.steps == "number")
				deopt.steps = [this.opt.steps,this.opt.steps];
			else if(this.opt.steps[i])
				deopt.steps = [this.opt.steps[i],this.opt.steps[i]];
		}
		deopt.borders = slider;
		var that = this;
		var de = new dragelement(handle, deopt);
		this._dragelements.push(de);
		this.lPos = [false, false];
		de.addEvent("onmove", function() {
			if(this.e.offsetLeft != that.lPos[0] || this.e.offsetTop != that.lPos[1]) {
				that.lPos = [this.e.offsetLeft, this.e.offsetTop],
				that.fireEvent("onchange", this.e, this.e._num)
			}
		});
		de.addEvent("ondrop", function() {
			that.fireEvent("ondrop", this.e, this.e._num)
		});
		if(opt.startValue) {
			if(typeof opt.startValue == "number")
				this.moveBy(i, opt.startValue);
			else
				this.moveBy(i, opt.startValue[i]);
		}
	}
}

slider.prototype = {
	fireEvent: function(e, handler, handleNumber) {
		if(this.events && this.events[e]) {
			var res = this.getRes(handleNumber);
			for(var k in this.events[e])
				if(k != "counter") this.events[e][k].call(this, res, handleNumber);
		}
	},
	addEvent: function(t, f) {
		if(!this.events) this.events = {};
		if(!this.events[t]) this.events[t] = {counter:0};
		this.events[t][this.events[t].counter] = f;
		this.events[t].counter++;
		return this.events[t].counter;
	},
	setEvent: function(o) {
		if(o.onchange)
			this.addEvent("onchange", o.onchange);
		if(o.ondrop)
			this.addEvent("ondrop", o.ondrop);
		if(o.ondrag)
			this.addEvent("ondrag", o.ondrag);
	},
	moveBy: function(h,v) {
		var handle = this.handle[h];
		var abPos = this.getAbPos(this.slider);
		if(this.opt.direction == "horizontal") {
			handle.style.left = abPos.x+((this.slider.offsetWidth-handle.offsetWidth)/this.opt.fromTo[1]*v) + "px";
		}
		else if(this.opt.direction == "vertical") {
			handle.style.top = abPos.y+((this.slider.offsetHeight-handle.offsetHeight)/this.opt.fromTo[1]*v) + "px";
		}
	},
	lock: function(i) {
		this._dragelements[i].lock();
	},
	unlock: function(i) {
		this._dragelements[i].unlock();
	},
	getRes: function(h) {
		var sap = this.getAbPos(this.slider);
		if(this.opt.direction == "horizontal") {
			return (this.handle[h].offsetLeft-sap.x)/(this.slider.offsetWidth-this.handle[h].offsetWidth)*(this.opt.fromTo[1]-this.opt.fromTo[0]) + this.opt.fromTo[0];
		}
		else if(this.opt.direction == "vertical") {
			return (this.handle[h].offsetTop-sap.y)/(this.slider.offsetHeight-this.handle[h].offsetHeight)*(this.opt.fromTo[1]-this.opt.fromTo[0]) + this.opt.fromTo[0];
		}
		return "a";
	},
	getAbPos: function(el) {
		var ret = {x:0,y:0};
		while(el) {
			if(el.tagName.toUpperCase() == "BODY" || !el.offsetWidth || !el.offsetHeight)
				el = false;
			else {
				ret.x += el.offsetLeft;
				ret.y += el.offsetTop;
				if(el.offsetParent && typeof(el.offsetParent) == "object")
					el = el.offsetParent;
				else
					el = el.parentNode;
			}
		}
		return ret;
	},
	setDefaultOpt: function(o) {
		for(var k in this.defaultOpt)
			if(!o[k]) o[k] = this.defaultOpt[k];
		return o;
	},
	defaultOpt: {
		sliderClassName: "slider",
		handleClassName: "handle",
		direction: "horizontal",
		handles: 1,
		fromTo: [0,100],
		handleValues: [0],
		spans: false
	}
};