//-----------------------------------//
//               JSON                //
//-----------------------------------//

var JSON = {
	encode: function(str) {
		var obj = "";
		if(typeof str == "object" && str.length) {
			obj += "["
			for(var k in str)
				obj += JSON.encode(str[k]) + ",";
			obj = obj.substr(0, obj.length-1) + "]";
		}
		else if(typeof str == "object") {
			obj += "{"
			for(var k in str)
				obj += '"' + k + '":' + JSON.encode(str[k]) + ",";
			obj = obj.substr(0, obj.length-1) + "}";
		}
		else {
			if(typeof str == "string")
				return '"'+JSON.doReplace(str)+'"';
			else //if(typeof str == "number" || typeof str == "boolean")
				return str;
		}
		return obj;
	},
	decode: function(str) { // zu JS
		str = str.replace(/"([^"]+?)":/g, "$1:").replace(/"/g, "\"");
		eval("var ret = "+str);
		return ret;
	},
	doReplace: function(str) {
		return str.replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r");
	}
};
