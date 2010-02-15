//-----------------------------------//
//               AJAX                //
//-----------------------------------//

var ajax = {
	request: function(options) {
		if(!options || !options.path) throw new Error("No path given in ajax.request.");
		var req = this.xmlObjectGetAvaible();
		if(!req) {
			var req = ajax.createXMLHttpRequest();
			ajax.xmlObject.push(req);
		}
		this.stateChanges(req, options);
		options = this.setDefault(options);
		req.open(options.method, options.path, options.asynchronous);
		this.setRequestHeader(req, options);
		data = null;
		if(options.data) {
			data = "";
			for(var key in options.data) {
				data += key + "=" + attr.data[key] + "&";
			}
		}
		req.send(data);
	},
	xmlObject: [],
	createXMLHttpRequest: function() {
		try{
			return new XMLHttpRequest();
		}
		catch (e){
			try{
				return new ActiveXObject("Msxml2.XMLHTTP");
			} 
			catch (e){
				try{
					return new ActiveXObject("Microsoft.XMLHTTP");
				} 
				catch (failed){
					return null;
				}
			}
		}
	}
};

ajax.request.prototype = {
	xmlObjectGetAvaible: function() {
		for(var i=0; i<ajax.xmlObject.length; i++) {
			if(ajax.xmlObject[i].readyState == 0 || ajax.xmlObject[i].readyState == 4)
				return ajax.xmlObject[i];
		}
		return false;
	},
	stateChanges: function(req, obj) {
		req.onreadystatechange = function() {
			var res = {text:req.responseText, xml:req.responseXML, header:req.getAllResponseHeaders()};
			this.response = res;
			switch(req.readyState) {
				case 4:
					if(obj.complete) obj.complete(res, req.status);
					if(req.status == 200 && obj.success) obj.success(res, req.status);
					else if(obj.failure) obj.failure(res, req.status);
					break;
				case 3:	
					if(obj.interactive) obj.interactive(res, req.status);
					break;
				case 2:	
					if(obj.loaded) obj.loaded(res, req.status);
					break;
				case 1:
					if(obj.loading) obj.loading(res, req.status);
					break;
				default:
					return false;
			}
		}
	},
	setRequestHeader: function(req, options) {
		if(options.reqHeader && options.reqHeader.length) {
			for(var i=0; i<options.reqHeader.length; i=i+2) {
				req.setRequestHeader(options.reqHeader[i], options.reqHeader[i+1]);
			}
		}
		else if(options.reqHeader) {
			for(var k in options.reqHeader)
				req.setRequestHeader(k, options.reqHeader[k]);
		}
	},
	setDefault: function(obj) {
		for(var k in this.defaults) {
			if(!obj[k]) obj[k] = this.defaults[k];
		}
		return obj;
	},
	defaults: {
		asynchronous: true,
		method: "GET",
		reqHeader: ["Content-Type",'text'],
		response: "text"
	}
}