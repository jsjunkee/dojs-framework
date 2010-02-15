//-----------------------------------//
//             Selector              //
//-----------------------------------//
// nutzt kein querySelector


if(!$A) {
	var $A = function(i) {
		if(!i) return [];
		if($defined(Object(i).toArray)) return i.toArray();
		var len = i.length || 0, res = new Array(len);
		while(len--)
			res[len] = i[len];
		return res;
	}
}

var selector = {
	apply: function(css, element) {
		element = element ? [element] : [document];

		if(element.querySelectorAll) {
			return element.querySelectorAll(css);
		}

		var returnObj = [];
		var parts = css.split(",");
		var i = parts.length;
		while(i--) {
			var flag = true;
			var singleCssSel = parts[i];
			var matchedElements = element;
			while(flag) {
				var match = singleCssSel.match(selector.regexp);
				if(!match || matchedElements.length == 0) { flag = false; break; }
				singleCssSel = singleCssSel.substr(match[0].length); // Damit match den nächsten erwischt
				switch(match[1].replace(/(\s|\t)+/g, "")) {
					case ">":	// child
						matchedElements = selector.childAdjacent(matchedElements, match, selector.getAllChilds);
						break;
					case "+":	// adjacent
						matchedElements = selector.childAdjacent(matchedElements, match, selector.getAdjacentSibling);
						break;
					default:	// descendant
						matchedElements = selector.descendant(matchedElements, match);
				}
			}
			returnObj = returnObj.concat(matchedElements);
		}
		return returnObj;
	},
	descendant: function(elements, match) {
		var ret = [];
		var len = elements.length;
		while(len--) {
			var buffer = [];
			switch(match[3].replace(/(\s|\t)+/g, "")) {
				case "#": buffer = [elements[len].getElementById(match[4])]; break; //ret.push
				case ".": buffer = $A($(elements[len]).getElementsByClassName(match[4])); break; //ret.concat(
				default: buffer = $A(elements[len].getElementsByTagName((match[3]+match[4]).replace(/(\s|\t)+/g, "")));
			}
			if(match[5]) {
				var sndBuffer = [];
				var buLe = buffer.length;
				while(buLe--) {
					if(selector.attributIs(buffer[buLe], match[7], match[6], match[10]))
						sndBuffer.push(buffer[buLe]);
				}
				buffer = sndBuffer;
			}
			ret = ret.concat(buffer);
		}
		return ret;
	},
	childAdjacent: function(elements, match, eles) {
		var ret = [];
		var len = elements.length;
		while(len--) {
			var childs = eles(elements[len]);
			var cl = childs.length;
			while(cl--) {
				switch(match[3].replace(/(\s|\t)+/g, "")) {
					case "#": var attr = "id"; break;
					case ".": var attr = "className"; break;
					default: var attr = "tagName"; break;
				}
				if(selector.attributIs(childs[cl], "=", attr, attr == "tagName" ? (match[3]+match[4]).replace(/(\s|\t)+/g, "") : match[4]))
					ret.push(childs[cl]);
			}
		}
		return ret;
	},
	attributIs: function(element, type, attr, value) {
		if(value == "*") return true;
		if(!element[attr]) return false;
		switch(type) {
			case "=":	return element[attr].toLowerCase() == value.toLowerCase();
			case "|=":	return element[attr].search(new RegExp("^"+value+"(\\-|$)")) != -1
			case "~=":	return element[attr].search(new RegExp("(^|\\s)"+value+"($|\\s)")) != -1
			default: return typeof element[attr] != "undefined";
		}
		return null;
	},
	getAllChilds: function(e) {
		var ret = [];
		var len = e.childNodes.length;
		while(len--)
			ret.push(e.childNodes[len]);
		return ret;
	},
	getAdjacentSibling: function(e) {
		while(e = e.nextSibling)
			if(e.tagName) return [e]; 
		return false;
	},
	regexp: /(>|\+|^)\s?\t?((.|#|)([a-zA-Z0-9\*_-]+)(\[([a-zA-Z]+)(\|=|\*=|~=|=|])(('|")([^'"]*)('|")\])?)?)/
	// /(>|\+|^)\s*\t*((.|#)([a-zA-Z0-9_-]+)(\[([a-zA-Z]+)(\|=|\*=|~=|=)('|")([^'"]*)('|")\])?)/
	// [1] == +|>|default [3] == #|.|default [4] == value (!bei tagname +[3]) [5] == [attr='value'] [6] == attr [7] == =|~=||=|*=|= [9] == value
};



if(cqjs) {
	var $$ = function() {
		var l = arguments.length, ret = [];
		while(l--) {
			var e = arguments[l];
			var t = $type(e);
			if(t == "collection" || t == "array") {
				var len = e.length, ar = new Array(len);
				while(len--)
					ar[len] = $(e[len]);
				ret = ret.concat(ar);
			}
			if(t == "element") ret = ret.concat([$(e)]);
			if(t == "string") ret = ret.concat($$(selector.apply(e)));
		}
		for(var k in Element.prototype) {
			ret[k] = (function() {
				var that = this;
				return function() {
					for(var i=0; i<ret.length; i++) {
						ret[i][that].apply(ret[i], arguments);
					}
				}
			}).apply(k);
		}
		return ret;
	}
	Element.prototype.getElements = function(e) {
		if(e.search(/^[^\.#\s\t>\+]*$/) != -1) return this.getElementsByTagName(e);
		return $$(selector.apply(e, this));
	}
}

