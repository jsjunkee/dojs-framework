//-----------------------------------//
//               Event               //
//-----------------------------------//
//Requires main.js

var Event = $try(function() { return Event || (window.event || function(){}); } , function() { return function(){} });

if(!Event.prototype.preventDefault) {
	Event.prototype.preventDefault = function() {
		this.returnValue = false;
	};
}

if(!Event.prototype.stopPropagation) {
	Event.prototype.stopPropagation = function() {
		Event._ieCapturingStopPropagation = true;
		this.cancelBubble = true;
	}
}

Event.prototype.stop = function() {
	this.preventDefault();
	this.stopPropagation();
}


Event.prototype.getTarget = function() {
	var target;
	if(this.target) target = this.target;
	if(this.srcElement) target = this.srcElement;
	if(target.nodeType == 3)
		target = target.parentNode;
	return target;
};

Event.prototype.getMouseButton = function() { // geht nicht wegen ie. button=l1 m4 r2
	if(this.which) {
		switch(this.which) {
			case 1: return "left";
			case 2: return "center";
			case 3: return "right";
			default: return false;
		}
	}
	else if(this.button) {
		if(Browser.Engine.trident) {
			switch(this.button) {
				case 1: return "left";
				case 4: return "middle";
				case 2: return "right";
				default: return false;
			}
		}
		else {
			switch(this.button) {
				case 0: return "left";
				case 1: return "middle";
				case 2: return "right";
				default: return false;
			}
		}
	}
	return false;
};

Event.prototype.getKey = function() {
	if(this.keyCode) code = this.keyCode;
	else if(this.which) code = this.which;
	for(var k in Event.keys)
		if(code == Event.keys[k]) return k;
	return String.fromCharCode(code);
};

Event.keys = {
	back_space: 8,
	tab: 9,
	enter: 13,
	shift: 16,
	strg: 17,
	alt: 18,
	caps_lock: 20,
	escape: 27,
	space: 32,
	left: 37,
	top: 38,
	right: 39,
	bottom: 40,
	f1: 112,
	f2: 113,
	f3: 114,
	f4: 115,
	f5: 116,
	f6: 117,
	f7: 118,
	f8: 119,
	f9: 120,
	f10: 121,
	f11: 122,
	f12: 123
};

Event.add = function(element, type, func, capturing) {
	if(element.addEventListener) {
		element.addEventListener(type, func, capturing);
		return [element, type, func, capturing];
	}
	else if(element.attachEvent) {
		if(!element["on" + type]) {
			element["on" + type] = function(e) { Event._ieDoEvent.apply(element, [e]) };
		}
		
		if(!element._ieEvent) element._ieEvent = {};
		if(!element._ieEvent[type]) element._ieEvent[type] = {id:0};
		
		element._ieEvent[type]["e" + element._ieEvent[type].id] = [func, capturing];
		element._ieEvent[type].id++;
		
		return [element, type, element._ieEvent[type]-1];
	}
	else {
		var oldF = element["on" + type];
		if(oldF)
			element["on" + type] = function(e) { oldF.apply(this, [e]); func.apply(this, [e]) };
		else element["on" + type] = func;
	}
}

Event.remove = function(id) {
	if(id[0].addEventListener) {
		id[0].removeEventListener(id[1], id[2], id[3]);
	}
	else if(id[0].attachEvent) {
		delete(id[0]._ieEvent[id[1]][id[2]]);
		
		var flag = true;
		for(var k in id[0]._ieEvent[id[1]])
			flag = false;
		if(flag)
			id[0][id[1]] = null;
	}
}

Event._ieDoEvent = function() {
	var type = window.event.type;
	var element = this;
	var userEvent = Event._ieAddUserEvent(window.event);
	
	if(!element._ieEvent || !element._ieEvent[type]) return;
	
	//capturing
	var bubblingFuncs = [];
	var capturingFuncs = [];
	var pNode = element.parentNode || false;
	while(pNode) {
		var capturingFuncsSec = [];
		if(pNode._ieEvent && pNode._ieEvent[type]) {
			for(var k in pNode._ieEvent[type]) {
				if(typeof pNode._ieEvent[type][k][0] == "function") {
					if(pNode._ieEvent[type][k][1] == true) capturingFuncsSec.push(pNode._ieEvent[type][k][0]);
					else
						bubblingFuncs.push(pNode._ieEvent[type][k][0]);
				}
			}
		}
		capturingFuncs = capturingFuncs.concat(capturingFuncsSec.reverse());
		pNode = pNode.parentNode || false;
	}
	
	var l = capturingFuncs.length;
	while(l--)
		capturingFuncs[l].apply(element, [userEvent]);
	
	//srcElement
	for(var k in element._ieEvent[type]) {
		if(typeof element._ieEvent[type][k][0] == "function") {
			element._ieEvent[type][k][0].apply(element, [userEvent]);
		}
	}
	
	if(!Event._ieCapturingStopPropagation) {
		//bubbling
		var l = bubblingFuncs.length;
		for(var i=0; i<l; i++)
			bubblingFuncs[i].apply(element, [userEvent]);
	}
	Event._ieCapturingStopPropagation = false;
	
	window.event.cancelBubble = true;
}

Event._ieAddUserEvent = function(e) {
	for(var k in Event.prototype)
		e[k] = Event.prototype[k];
	return e;
}

Element.prototype.addEvent = function(t, f, c) {
	Event.add(this, t, f, c);
	return this;
}
Element.prototype.removeEvent = function() {
	Event.remove(argumetns.splice(0,0,this));
	return this;
}

