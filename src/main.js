//------------------------------------//
// dojs - compaqjavascript framework //
//------------------------------------//

var dojs = {
	version: 1.0,
	libs: ["element", "event", "ajax", "animation", "json", "selector", "drag", "slider"],
	include: function(data,options) {
		data = !data || data == "all" ? dojs.libs : data;
		data = $splat(data);
		var base = options.base+"/";
		if(!base) base = "";
		for(var i=0; i<data.length; i++) {
			document.write("<script type='text/javascript' src='"+base+data[i]+".js'></script>");
		}
	}
};



// $(element|string) => element
var $ = function(element) {
	element = typeof element == "string" ? document.getElementById(element) : element; // entweder Id oder schon das Element
	if(Element.__noRealElement === true) { // Wenn IE
		for(var k in Element.prototype) {
			element[k] = Element.prototype[k];
		}
		return element;
	}
	else // Andere Browser
		return element;
}

var __elementFunc = function(tagName) {
	var element = $(document.createElement((typeof tagName == "string" ? tagName : "div")));
	if(!arguments[1]) return element;
	else if(typeof arguments[1] == "object") {
		for(var k in arguments[1]) { if(k == "css") element.css(arguments[1][k]); else element[k] = arguments[1][k]; }
		if(arguments[2]) {
			for(var i=0; i<arguments[2].length; i++) {
				if(typeof arguments[2][i] != "undefined")
					element.appendChild(arguments[2][i]);
			}
		}
	}
	else {
		for(var i=0; i<arguments[1].length; i++)
			element.appendChild(arguments[1][i]);
	}
	return element;
};
	
if(!Element) {
	var Element = __elementFunc
	Element.__noRealElement = true;
}
else {
	var oldElement = Element;
	Element = __elementFunc
	Element.prototype = oldElement.prototype;
}

//-----------------------------------//
//             HELPERS               //
//-----------------------------------//

var $type = function(t) { // kann event nicht! collection und element sind nicht sicher
	if(!$defined(t)) return false;
	var tot = typeof t;
	if(t == window) return "window";
	if(t == document) return "document";
	if(tot == "number" || tot == "function" || tot == "string" || tot == "boolean") return tot;
	return $try(
		function() { if(t.appendChild == $type._el.appendChild) return "element"; else error; },
		function() { if($type(t[0]) == "element") return "collection"; else error; },
		function() { if(t.nodeValue.search(/^\s$/) == 0) return "whitespace"; else error; },
		function() { if(t.nodeValue) return "textnode"; else error; },
		function() {
			var tc = t.constructor;
			for(var k in $type.types) {
				if($type.types[k].constructor == tc) return k;
			}
			error;
		},
		function() { if({}.constructor == t.constructor) return "object"; else error; },
		function() { return "unknown"; }
	);
};

$type.types = {
	regexp: /s/g,
	array: [],
	date: new Date()
};
$type._el = new Element();

var $defined = function(t) {
	return typeof t == "undefined" || t == null ? false : true;
}

var $each = function(o,func) {
	var type = $type(o);
	if(type == "array") {
		for(var i=0; i<o.length; i++)
			func.call(o, o[i]);
	}
	else if(type == "object") {
		for(var k in o)
			func(o[k], k);
	}
	else throw new Error("First argument in $each in no array and no object.");
};

var $lambda = function(v) {
	return function() {
		return v;
	};
}

var $random = function(min, max) {
	return Math.random()*(max-min)+min;
}

var $splat = function(e) {
	if($type(e) == "array" || !$defined(e)) return e;
	return [e];
}

var $try = function() {
	for(var i=0; i<arguments.length; i++) {
		try { return arguments[i](); } catch(e) { }
	}
	return null;
}

var $clear = function(id) {
	window.clearInterval(id);
}

var $A = function(i) {
	if($type(i) == "array") return i;
	if(!i) return [];
	if($defined(Object(i).toArray)) return i.toArray();
	var len = i.length || 0, res = new Array(len);
	while(len--)
		res[len] = i[len];
	return res;
}

if(!([]).forEach) {
	Array.prototype.forEach = function(f) {
		var len = this.length;
		for(var i=0; i<len; i++) {
			f.call(window, this[i], i, this);
		}
	};
}

String.prototype.toCssSyntax = function() {
	var reg = /[a-z]{1}([A-Z]{1})/g;
	if(reg.test(this))
		return this.replace(reg, function(m) { return m.substr(0,1)+"-"+m.substr(1,1).toLowerCase(); });
	else
		return this;
}

String.prototype.toJsSyntax = function() {
	var reg = /-([a-z]{1})/g;
	if(reg.test(this))
		return this.replace(reg, function(m,h) { return h.toUpperCase(); });
	else
		return this;
}

String.prototype.hexToRgb = function() {
	var matches = this.match(/#[0-9a-fA-F]{3,6}/g);
	for(var i=0; i<matches.length; i++) {
		var hexCode = matches[i].substr(1);
		if(hexCode.length == 3) hexCode = [hexCode.substr(0,1) + hexCode.substr(0,1), hexCode.substr(1,1) + hexCode.substr(1,1), hexCode.substr(2,1) + hexCode.substr(2,1)];
		else hexCode = [hexCode.substr(0,2), hexCode.substr(2,2), hexCode.substr(4,2)]; 
		for(var j=0; j<3; j++)
			hexCode[j] = parseInt(hexCode[j], 16);
		var hexCode = "rgb("+hexCode.join(",")+")";
		hex = hex.replace(matches[i], hexCode);
	}
	return hex;
}

Function.prototype.delay = function(t, that, args) { //ms
	var func = this;
	window.setTimeout(function() { func.apply(that ? that : window, args || []); }, t);
}

Function.prototype.periodical = function(t, that, args) { //ms
	var func = this;
	return window.setInterval(function() { func.apply(that ? that : window, args || []); }, t);
}

//ist zum Teil kopiert
//funktioniert nicht in opera

var Browser = {
	Platform: {},
	Engine: {}
};
Browser.Platform = {
	name: $defined(window.orientation) ? "ipod" : (navigator.userAgent.toLowerCase().match(/win|mac|linux|playstation\sportable/i) || ["other"])[0]
};
Browser.Engine = {
	name: (window.ActiveXObject ? "trident" : (window.opera ? "presto" : (!navigator.taintEnabled ? "webkit" : (document.getBoxObjectFor || window.mozInnerScreenX != null ? "gecko" : "other")))),
	presto: (!window.opera) ? false : ((arguments.callee.caller) ? 960 : ((document.getElementsByClassName) ? 950 : 925)),
	trident: (!window.ActiveXObject) ? false : ((window.XMLHttpRequest) ? ((document.querySelectorAll) ? 6 : 5) : 4),
	gecko: (!document.getBoxObjectFor && window.mozInnerScreenX == null) ? false : ((document.getElementsByClassName) ? 19 : 18),
	webkit: (typeof navigator.taintEnabled == "unknown" || navigator.taintEnabled) ? false : ((Browser.Features && Browser.Features.xpath) ? ((Browser.Features.query) ? 525 : 420) : 419)
};



Browser.Platform[Browser.Platform.name] = true;

dojs.include("all",{base:"src"});

