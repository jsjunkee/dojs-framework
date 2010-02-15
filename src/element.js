//-----------------------------------//
//              Element              //
//-----------------------------------//
//Requires main.js

Element.prototype.hasClass = function(className) {
	return this.className.search(new RegExp("(\\s|^)"+className+"(\\s|$)")) != -1 ? true : false;
}


Element.prototype.toggleClass = function(className) {
	this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
	return this;
}


Element.prototype.addClass = function(className) {
	this.className.replace(/\s/g, "") == "" ? this.className = className : this.className += " "+className;
	return this;
}


Element.prototype.removeClass = function(className) {
	var theClassName = this.className;
	if(this.hasClass(className)) // esistiert die Klasse überhaupt?
		this.className = theClassName.replace(className, "").replace(/(\s)+/, " ").replace(/(^\s|\s$)/, ""); // Entsthende Whitespaces entfernen
	return this;
}


Element.prototype.getStyle = function() {
	//Wenn mehrere Elemente gegeben sind
	if(arguments.length > 1) {
		var ret = [];
		for(var i=0; i<arguments.length; i++){ // für jeden einzelnen nochmal die Funktion aufrufen
			ret[arguments[i]] = this.getStyle(arguments[i], null); //pseudo
		}
		return ret;
	}
	
	if(window.getComputedStyle) var currentStyle = window.getComputedStyle(this, null);	//w3c
	else if(this.currentStyle) var currentStyle = this.currentStyle;					//IE
	
	if(arguments.length == 0) return currentStyle; // Wenn keine Argumente übergeben
	
	var style = arguments[0];
	var _style = style.toCssSyntax();
	
	function isIn(w, a) {
		return w in a;
	}
	
	if(isIn(style, currentStyle) &&
		currentStyle[style] &&
		currentStyle[style].toString() != "") {
			return currentStyle[style];
	}
	
	if(/^(border(Style|Width|Color)|padding|margin)$/.test(style)) {
		var direction = ["Top", "Right", "Bottom", "Left"];
		var post = "";
		if(/(style|width|color)/i.test(style)) {
			post = RegExp.$1;
			style = "border";
		}
		var value = [];
		for(var i=0; i<direction.length; i++) {
			value[i] = currentStyle[style + direction[i] + post];
		}
		for(var i=0; i<value.length-1; i++) {
			if (value[i] != value[i + 1]) break;
			if (i == value.length - 2)
				return value[i];
		}
		if(value[1] == value[3]) {
			if (value[0] == value[2])
				return value[0] + " " + value[1];
			else
				return value[0] + " " + value[1] + " " + value[2];
		}
		return value.join(" ");
	}
	if(/^border(Top|Right|Bottom|Left)$/.test(style)) {
		var types = ["Width", "Style", "Color"];
		var value = [];
		for(var i=0; i<types.length; i++){
			value[i] = currentStyle[style + types[i]];
		}
		return value.join(" ");
	}
	if(style == "border"){
		var direction = ["Top", "Right", "Bottom", "Left"];
		var value = [];
		for(var i=0; i<direction.length; i++) {
			value[i] = this.getStyle(style + direction[i]);
			if(value[i] != value[0])
				return "";
		}
		return value[0];
	}
	if(style == "background") {
		var types = ["Color", "Image", "Repeat", "Attachment"];
		if(currentStyle.backgroundPosition)
			types.push("Position");
		else {
			types.push("PositionX");
			types.push("PositionY");
		}
		var value = [];
		for(var i=0; i<types.length; i++) {
			value[i] = currentStyle[style + types[i]];
		}
		return value.join(" ");
	}
	if(style == "backgroundPosition") {
		return currentStyle.backgroundPositionX + " " + currentStyle.backgroundPositionY;
	}
	if(style == "font") {
		var types = ["Style", "Variant", "Weight", "Size"];
		var value = [];
		for(var i=0; i<types.length; i++) {
			value[i] = currentStyle[style + types[i]];
		}
		return value.join(" ") + "/" + currentStyle.lineHeight + " " + currentStyle.fontFamily;
	}
	if(style == "clip") {
		var direction = ["Top", "Right", "Bottom", "Left"];
		var value = [];
		for (var i=0; i<direction.length; i++) {
			value[i] = this.getStyle(style + direction[i]);
			if (value[0] == "auto") return "auto";
		}
		return "rect(" + value.join(" ") + ")";
	}
};


Element.prototype.css = function(cssCode) {
	if(typeof cssCode == "string") {
		var row = cssCode.split(";");
		for(var i=0; i<row.length; i++) {
			if(row[i]) {
				var keyvalue = row[i].split(":");
				this.style[keyvalue[0].replace(/\s/g, "").toJsSyntax()] = keyvalue[1].replace(/(^\s|\s$)/, "");
			}
		}
		return this;
	}
	else if(typeof cssCode == "object") {
		for(var k in cssCode)
			this.style[k] = cssCode[k];
		return this;
	}
	else
		return false;
};


Element.prototype.set = function(obj) {
	for(var k in obj)
		this[k] = obj[k];
	return this;
};


Element.prototype.observe = function(event, func) {
	if(!this.__events) this.__events = {};
	if(!this.__events[event]) this.__events[event] = [];
	if(this.addEventListener) {
		this.addEventListener(event, func, false);
		this.__events[event].push(func);
		return func;
	}
	else if(this.attachEvent) {
		var that = this;
		var closure = function() { func.apply(that); };
		this.attachEvent("on"+event, closure);
		this.__events[event].push(closure);
		return closure;
	}
};


Element.prototype.stopObserve = function(event, func) {
	if(!event) {
		for(var k in this.__events)
			this.stopObserve(k);
		return this;
	}
	if(!func) {
		for(var i=0; i<this.__events[event].length; i++)
			this.stopObserve(event, this.__events[event][i]);
		return this;
	}
	if(this.removeEventListener) {
		this.removeEventListener(event, func, false);
	}
	else if(this.detachEvent) {
		this.detachEvent("on"+event, func);
	}
	return this;
};


Element.prototype.getUnitProportion = function(unit1, unit2) {
	var testCase1 = new Element();
	var testCase2 = new Element();
	testCase1.css("position:relative;left:-100"+unit1+";width:100"+unit1+";");
	testCase2.css("position:relative;left:-100"+unit2+";width:100"+unit2+";");
	this.appendChild(testCase1);
	this.appendChild(testCase2);
	var proportion = testCase1.offsetWidth/testCase2.offsetWidth;
	testCase1.destroy();
	testCase2.destroy();
	return proportion;
};


Element.prototype.destroy = function() {
	return this.parentNode ? this.parentNode.removeChild(this) : this;
};


Element.prototype.render = function() {
	var re = new Element();
	this.appendChild(re);
	re.destroy();
	return this;
};


Element.prototype.toggle = function(key) {
	if(this.style[key].toLowerCase() == Element.__toggle[key][0])
		this.style[key] = Element.__toggle[key][1];
	else
		this.style[key] = Element.__toggle[key][ß];
	return this;
};

Element.__toggle = {
	display: ["block", "none"],
	visibility: ["visible", "hidden"]
};


if(!document.getElementsByClassName) {
	Element.prototype.getElementsByClassName = function(cN) {
		var nodes = this.getElementsByTagName("*");
		var counter = nodes.length;
		var ret = [];
		while(counter--) {
			if(nodes[counter].className == cN) {
				ret.push(nodes[counter]);
			}
		}
		return ret;
	};
}
Element.nameColors = {
black:"rgb(0,0,0)",white:"rgb(255,255,255)",red:"rgb(255,0,0)",green:"rgb(0,255,0)",blue:"rgb(0,0,255)",yellow:"rgb(255,255,0)",cyan:"rgb(0,255,255)",magenta:"rgb(255,0,255)",gray:"rgb(190,190,190)",purple:"rgb(160,32,240)",maroon:"rgb(176,48,96)",Navy:"rgb(0,0,128)"
};
