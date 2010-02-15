//-----------------------------------//
//            DragAndDrop            //
//-----------------------------------//
//Requires main.js


function dragelement(e, o) {
	this.dragging = false;
	this.e = e;
	this.startPos = [parseInt(this.e.style.left), parseInt(this.e.style.top)];
	this.eStylePos = this.e.style.position;
	this.opt = o = this.setDefault(o);
	
	var absPos = this.getAbPos(this.e);
	this.e.style.position = "absolute";
	
	this.insertBefore = false;
	this.startParentNode = this.e.parentNode;
	if(this.opt.toBody === true) {
		for(var i=0; i<this.e.parentNode.childNodes.length; i++) {
			if(this.e.parentNode.childNodes[i] == this.e){
				if(i-1 > 0 && this.e.parentNode.childNodes[i-1]) this.insertBefore = this.e.parentNode.childNodes[i-1];
			}
		}
		this.e.parentNode.removeChild(this.e);
		document.body.appendChild(this.e);
	}
	
	this.e.style.left = absPos.x+"px";
	this.e.style.top = absPos.y+"px";
	
	this.createPosX = this.e.offsetLeft;
	this.createPosY = this.e.offsetTop;
	
	this.hiddenPosX = false;
	this.hiddenPosY = false;
	this.locked = false;
	
	this.setEvents(o);
	
	this.makeItDragable();
	return this;
}


dragelement.prototype = {
	_dragableInfo:[],
	addE: function(e, en, f) {
		this._dragableInfo.push([en, f]);
		var x=0;
		if(e.addEventListener) {
			x = e.addEventListener(en, f, false);
		}
		else if(e.attachEvent) {
			x = e.attachEvent("on"+en, f);
		}
	},
	setEvents: function(o) {
		if(o.onstart)
			this.addEvent("onstart", o.onstart);
		if(o.onmove)
			this.addEvent("onmove", o.onmove);
		if(o.ondrop)
			this.addEvent("ondrop", o.ondrop);
		if(o.ondropinelement)
			this.addEvent("ondropinelement", o.ondropinelement);
		if(o.onoverdropelement)
			this.addEvent("onoverdropelement", o.onoverdropelement);
	},
	destroy: function(opt) {
		if(!opt) opt = {};
		this.lock();
		if(opt.node && opt.node === true)
			this.e.parentNode.removeChild(this.e);
		if(opt.showOnStartPos && opt.showOnStartPos === true) {
			this.e.style.left = this.startPos[0];
			this.e.style.top = this.startPos[1];
			this.e.style.position = this.eStylePos;
			if(this.opt.toBody === true) {
				this.e.parentNode.removeChild(this.e);
				if(this.insertBefore === false)
					this.startParentNode.appendChild(this.e);
				else
					this.startParentNode.insertBefore(this.e, this.insertBefore);
			}
		}
		this.e.onselectstart=function(){return true;};		//IE
		this.e.ondrag=function(){return true;};			//IE
		this.e.onmousedown = function() { return true; }	//FF
		return true;
	},
	lock: function() {
		this.locked = true;
		return this;
	},
	unlock: function() {
		this.locked = false;
		return this;
	},
	makeItDragable: function() {
	
		var that = this;
		
		var md = function(e) {
			if(that.locked === true) return;
			that.dragging = true;	
			that.xOf = e.clientX-that.e.offsetLeft;
			that.yOf = e.clientY-that.e.offsetTop;
			that.hiddenPosX = that.xOf;
			that.hiddenPosY = that.yOf;
			var s = that.getPageOffset();
			that.sScroll = [s.x,s.y];
			if(that.opt.ghosting) {
				that.ghostingNode = that.e.cloneNode(true);
				if(that.ghostingNode.className == "") that.ghostingNode.className = that.opt.ghostingClass;
				else that.ghostingNode.className += " " + that.opt.ghostingClass;
				for(var k in that.opt.ghostingStyle) that.ghostingNode.style[k] = that.opt.ghostingStyle[k];
				that.e.parentNode.insertBefore(that.ghostingNode,that.e);
			}
			if(that.opt.zIndex) {
				that.oldStyleValuesZIndex = that.e.style.zIndex;
				that.e.style.zIndex = that.opt.zIndex;
			}
			if(that.opt.opacity) {
				that.oldStyleValuesOpacity = that.e.style.opacity ? that.e.style.opacity : (that.e.style.filter ? that.e.style.filter:"");
				that.e.style.opacity = that.opt.opacity;
				that.e.style.filter = "alpha(opacity="+(that.opt.opacity*100)+")";
			}
			that.fireDragEvent("onstart");
		};
		
		var mu = function(e) {
			if(that.dragging === true) {
				if(that.opt.ghosting)
					that.e.parentNode.removeChild(that.ghostingNode);
				if(that.checkIfInDropelement("mu")) {
					for(var i=0; i<dropelement.elements.length; i++) {
						if(dropelement.elements[i][9] && dropelement.elements[i][7]) {
							dropelement.elements[i][9] = false;
							dropelement.elements[i][7].call(dropelement.elements[i][0],that);
						}
					}
					that.fireDragEvent("ondropinelement");
				}
				that.fireDragEvent("ondrop");
				if(that.opt.zIndex) that.e.style.zIndex = that.oldStyleValuesZIndex;
				if(that.opt.opacity) {
					that.e.style.opacity = that.oldStyleValuesOpacity;
					that.e.style.filter = that.oldStyleValuesOpacity;
				}
			}
			that.dragging = false;
		};
		
		var mm = function(e) {
			if(that.dragging === true) {
				var s = that.getPageOffset();
				if(that.opt.steps != false) {
					var ws = that.windowSizes();
					if(that.opt.xAxis == false)
						that.acX = that.e.offsetLeft;
					else
						that.acX = Math.round((e.clientX-that.xOf-that.createPosX)/that.opt.steps[0])*that.opt.steps[0] + that.createPosX;
					if(that.opt.yAxis == false)
						that.acY = that.e.offsetTop;
					else
						that.acY = Math.round((e.clientY-that.yOf-that.createPosY)/that.opt.steps[1])*that.opt.steps[1] + that.createPosY;
					
					if(that.opt.borders != false) {
						that.hiddenPosX = e.clientX - that.xOf;
						that.hiddenPosY = e.clientY - that.yOf;
					}
				}
				else {	
					if(that.opt.xAxis == false)
						that.acX = that.e.offsetLeft;
					else
						that.acX = e.clientX - that.xOf;
					if(that.opt.yAxis == false)
						that.acY = that.e.offsetTop;
					else
						that.acY = e.clientY - that.yOf;
				}
				if(that.opt.borders != false) {
					that.checkIfInParent(that.acX, that.acY);
				}
				else {
					that.e.style.left = that.acX+"px";
					that.e.style.top = that.acY+"px";
				}
				that.fireDragEvent("onmove");
				if(that.checkIfInDropelement("mm") && that.onOverDropElementFuncs && that.onOverDropElementFuncs.length != 0)
					that.fireDragEvent("onoverdropelement");
			}
		};
		
		var sc = function(e) {
			if(that.dragging === true) {
				var s = that.getPageOffset();
				if(that.opt.borders != false) {
					that.checkIfInParent(
						parseInt(that.e.style.left) + (s.x-that.sScroll[0]),
						parseInt(that.e.style.top) + (s.y-that.sScroll[1])
					);
				}
				else {
					that.e.style.left = parseInt(that.e.style.left) + (s.x-that.sScroll[0]);
					that.e.style.top = parseInt(that.e.style.top) + (s.y-that.sScroll[1]);
				}
				that.xOf = that.xOf+(s.x-that.sScroll[0])*(-1); that.sScroll[0] = that.sScroll[0]+(s.x-that.sScroll[0]);
				that.yOf = that.yOf+(s.y-that.sScroll[1])*(-1); that.sScroll[1] = that.sScroll[1]+(s.y-that.sScroll[1]);
			}
		};
		
		//-----------
		var elem = this.opt.handler ? this.opt.handler : this.e;
		//------------
		this.addE(elem, "mousedown", md);
		this.addE(document, "mouseup", mu);
		this.addE(document, "mousemove", mm);
		this.addE(window, "scroll", sc);
		
		
		this.e.onselectstart=function(){return false;};		//IE
		this.e.ondrag=function(){return false;};			//IE
		this.e.onmousedown = function() { return false; }	//FF
		
		this.startPosX = that.e.offsetLeft;
		this.startPosY = that.e.offsetTop;
		
		this.dontTouche = false;
	},
	getPageOffset: function() {
		var xs,ys;
		if (self.pageYOffset) {
			ys = self.pageYOffset;
			xs = self.pageXOffset;
		}
		else if (document.documentElement && document.documentElement.scrollTop){
			ys = document.documentElement.scrollTop;
			xs = document.documentElement.scrollLeft;
		}
		else if (document.body) {
			ys = document.body.scrollTop;
			xs = document.body.scrollLeft;
		}
		return {x:xs, y:ys};
	},
	getAbPos: function(el) {
		var ret = {}; ret.x = 0; ret.y = 0;
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
	checkIfInParent: function(acX, acY) {
		var ch = {x:false,y:false};
		var pn = this.opt.borders;
		var pepos = this.getAbPos(pn);
		if(this.opt.ignoreBordersX === false) {
			if(acX >= pepos.x && acX+this.e.offsetWidth <= pepos.x+pn.offsetWidth) {
				this.e.style.left = acX+"px";
				ch.x = true
			}
			else {
				var eow = pn.offsetWidth;
				if(pn.tagName.toLowerCase() == "body") eow = this.bodySizes().x;
				if(acX <= pepos.x) { this.e.style.left = pepos.x+"px"; }
				else if(acX+this.e.offsetWidth >= pepos.x+eow) {
					this.e.style.left = pepos.x+eow-this.e.offsetWidth+"px";
				}
				this.fireDragEvent("onhitborder");
			}
		}
		if(this.opt.ignoreBordersY === false) {
			var eoh = pn.offsetHeight;
			if(pn.tagName.toLowerCase() == "body") eoh = this.bodySizes().y;
			if(acY > pepos.y && acY+this.e.offsetHeight < pepos.y+eoh) {
				this.e.style.top = acY+"px";
				ch.y = true;
			}
			else {
				if(acY < pepos.y ) { this.e.style.top = pepos.y+"px"; }
				else if(acY+this.e.offsetHeight > pepos.y+eoh) {
					this.e.style.top = pepos.y+eoh-this.e.offsetHeight+"px";
				}
				this.fireDragEvent("onhitborder");
			}
		}
		return ch;
	},
	checkIfInDropelement: function() {
		for(var i=0; i<dropelement.elements.length; i++) {
			var d = dropelement.elements[i];
			if(	d[8] === true &&
				this.e.offsetLeft + this.e.offsetWidth/2 >= d[1] &&
				this.e.offsetLeft + this.e.offsetWidth/2 <= d[1]+d[3] &&
				this.e.offsetTop  + this.e.offsetHeight/2 >= d[2] &&
				this.e.offsetTop + this.e.offsetHeight/2 <= d[2]+d[4]
			) {
				if(arguments[0] == "mu" && d[5]) d[5].call(d[0],this);
				if(arguments[0] == "mm" && d[6]) d[6].call(d[0],this);
				dropelement.elements[i][9] = true;
				return true;
			}
			else {
				if(dropelement.elements[i][7] && dropelement.elements[i][9]) {
					dropelement.elements[i][7].call(d[0],this);
					dropelement.elements[i][9] = false;
				}
			}
		}
	},
	bodySizes: function() {
		var ret = {x:false,y:false};
		if (window.innerHeight && window.scrollMaxY) {	
			ret.x = document.body.scrollWidth;
			ret.y = window.innerHeight + window.scrollMaxY;
		}
		else if (document.body.scrollHeight > document.body.offsetHeight){
			ret.x = document.body.scrollWidth;
			ret.y = document.body.scrollHeight;
		}
		else {
			ret.x = document.body.offsetWidth;
			ret.y = document.body.offsetHeight;
		}
		return ret;
	},
	windowSizes: function() {
		var ret = {x:false,y:false};
		if(typeof(window.innerHeight) == "number") {
			ret.x = window.innerWidth;
			ret.y = window.innerHeight;
		}
		else if(document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight )) {
			ret.x = document.documentElement.clientWidth;
			ret.y = document.documentElement.clientHeight;
		}
		else if(document.body && ( document.body.clientWidth || document.body.clientHeight )) {
			ret.x = document.body.clientWidth;
			ret.y = document.body.clientHeight;
		}
		return ret;
	},
	addEvent: function(t, f) {
		if(!this.events) this.events = {};
		if(!this.events[t]) this.events[t] = {counter:0};
		this.events[t][this.events[t].counter] = f;
		this.events[t].counter++;
		return this.events[t].counter-1;
	},
	removeEvent: function(t,i) {
		delete(this.events[t][i]);
	},
	fireDragEvent: function(t){
		if(this.events && this.events[t]) {
			var funcs = this.events[t];
			for(var k in funcs) {
				if(k != "counter") funcs[k].call(this, this.e);
			}
		}
		return this;
	},
	toStartPos: function() {
		this.e.style.top = this.createPosY;
		this.e.style.left = this.createPosX;
	},
	getElement:function() {
		return this.e;
	},
	setDefault: function(o) {
		if(!$defined(o)) return this._default;
		if(o.xAxis == false) o.ignoreBordersX = true;
		if(o.yAxis == false) o.ignoreBordersY = true;
		for(var key in this._default)
			if(typeof o[key] == "undefined") o[key] = this._default[key];
		return o;
	},
	_default: {
		steps:false,
		xAxis: true,
		yAxis: true,
		borders: false,
		ignoreBordersX: false,
		ignoreBordersY: false,
		scroll: true,
		zIndex: false,
		opacity: false,
		toBody: false,
		ghostingClass: "dragAndDropGhosting",
		ghostingStyle: {}
	}
};

var dropelement = {
	add: function(e, op) {
		var abPos = dropelement.getAbPos(e);
		dropelement.elements.push([e,abPos.x,abPos.y,e.offsetWidth,e.offsetHeight,op.ondrop,op.onhover,op.onout,true]);
		return dropelement.elements.length-1;
	},
	lock: function(i) {
		if(!dropelement.elements[i]) return false;
		dropelement.elements[i][8] = false;
	},
	unlock: function(i) {
		if(!dropelement.elements[i]) return false;
		dropelement.elements[i][8] = true;
	},
	isLocked: function(i) {
		if(!dropelement.elements[i]) return null;
		return (dropelement.elements[i][8] == false);
	},
	elements: [],
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
	}
};

