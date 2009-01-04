(function(){
/*
 * YAHOO.util.Short 0.1
 * A really short way to write YUI
 * Licensed under the MIT
 * Copyright 2008 Kean Loong Tan
 * $Date: 2008-12-17
 */
 
var doc = document,
	win = window,
	UTIL = YAHOO.util,
	DOM = UTIL.Dom,
	EVENT = UTIL.Event,
	REGION = UTIL.Region,
	CONNECT = UTIL.Connect,
	SELECT = win.Sizzle ? win.Sizzle : UTIL.Selector.query,
	ELEMENT = UTIL.Element,
	FILTER = function(selector, o){
		if (win.Sizzle)
			return win.Sizzle.filter(o, selector)
		return UTIL.Selector.filter(selector, o);
	};

var isFn = function(o) { return typeof o === "function" };
var isStr = function(o) { return typeof o === "string" };
var isObj = function(o) { return typeof o === "object" };
var isNode = function(o) { return o.nodeType; };
//var isHTML = function(o) { return /^[^<]*(<(.|\s)+>)[^>]*$/.exec(o) };

/*
var debug = 1;
var firebug = function(o) {	if (debug) try { console.log(o) } catch(e){} }
*/
// yQ for internal use YAHOO.util.Short for global use
var yQ = win.YAHOO.util.Short = function( selector, context ) {
	// Constructor
	return new (yQ.fn).init( selector, context );
};

yQ.fn = yQ.prototype = {
	length: null,
	selector: null,
	init: function(selector, context) {
		var $ = this;
		if (!selector) {
			$[0]=doc;
			$.length = 1;
		}
		
		// if nodes
		else if ( isNode(selector) ) {
			$[0] = selector;
			$.length = 1;
		}
		// if CSS query
		else if (isStr(selector)) {
			/*if (isHTML(selector)) {
				var x = document.createElement('P');
				//x.innerHTML = selector;
				//alert(x.firstChild);
				//this[0]=document;
				//this[0]=x.firstChild;
				this.length = 0;
				//if (this[0].nodeType )
			}
			else {*/
				var result = SELECT(selector);
				for (var i=0; i < result.length; i++)
					$[i] = result[i];
				$.length = result.length;
				$.selector = selector;
				//alert("AS");
			//}
		}
		// if function is passed
		else if (isFn(selector)) {
			EVENT.onDOMReady(function(){ 
				selector.call(doc, yQ);
			});
		}
		return $;
	},
	
	/*forAll: function(fn) {
		for(var i=0; i< this.length; i++)
			fn.call(this[i]);
	},*/
	
	each: function(fn) {
		var $ = this;
		if (isFn(fn)) 
			for (var i=0; i < $.length; i++) {
				fn.call($[i], i);
			}
		return $;
	},
	
	unique : function(a) {
		var r = [];
		o:for(var i = 0, n = a.length; i < n; i++) {
			for(var x = i + 1 ; x < n; x++) {
				if(a[x]==a[i]) continue o;
			}
			r[r.length] = a[i];
		}
		return r;
	},
	
	wipe: function(n) {
		var $ = this;
		n = n || 0;
		for (var i = n; i < this.length; i++)
			delete $[i];

		$.length = n;
	},
	
	eq: function(num){
		var $ = this;
		$[0] = $[num];
		$.wipe(1);

		return $;
	},
	
	addClass: function(str) {
		DOM.addClass(this, str);
		return this;
	},
	
	removeClass: function(str) {
		DOM.removeClass(this, str);
		return this;
	},
	
	hasClass: function(str) {
		return DOM.hasClass(this, str);
	},
	
	toggleClass: function(str) {
		var $ = this;
		$.each(function(i){
			DOM.hasClass($[i], str)? DOM.removeClass($[i], str) : DOM.addClass($[i], str);
		});
		return $;
	},
	
	replaceClass: function(str, str2) {
		DOM.replaceClass(this, str, str2);
		return this;
	},
	
	html: function(str) {
		var ie = /*@cc_on!@*/false;
		var $ = this;

		if (isStr(str)) {
			if (ie)
				$.each(function(i){	$[i].innerHTML = str; });
			else {
				
				$.each(function(i){
					var newEl = $[i].cloneNode(false);
					newEl.innerHTML = str;
					$[i].parentNode.replaceChild(newEl, $[i]);
				});
			}
		}
		else if (str)
			return $[0].innerHTML;
			
		return $;
	},
	
	val: function(str) {
		var $ = this;
		if (str)
			$.each(function(i){
				$[i].value = str;
			});

		else
			return $[0].value;
			
		return $;
	},
	
	filter: function(selector) {
		var $ = this,
			elems = FILTER($, selector);

		$.wipe(elems.length);
		$.each(function(i){ $[i] = elems[i] });
	
		return $;
	},
	
	is: function(selector, obj) {
		var o = [];
		if (obj) {o[0] = obj }
		else { o = this; }
		var elems = FILTER(o, selector);

		return elems.length ? true: false;
	},
	
	// we just pass this to the selector filter and wrap them in :not
	not: function(selector) {
		var $ = this;
		var elems = FILTER($, ":not("+selector+")");
		$.wipe(elems.length);
		$.each(function(i){ $[i] = elems[i]; });
		$.length = elems.length;
		
		return $;
	},
	
	add: function(selector) {
		var elems = SELECT(selector) || [];
		for(var i=this.length; i<this.length+elems.length; i++)
			this[i] = elems[i-this.length];
			
		this.length += elems.length;
		
		return this;
	},
	
	children: function(selector) {
		var $ = this,
			elems = [];

		$.each(function(i){ 
			// cause we are concatenating array with array			
			elems = elems.concat(DOM.getChildren($[i]));
		});

		if (selector)
			elems = FILTER(elems, selector);
			
		// we wipe first, so we increase 'this' length for easy looping to match with elems
		$.wipe(elems.length);

		$.each(function(i){
			$[i] = elems[i];
		});
			
		return $;
	},
	
	parent: function(){
		var elems=[],
			$ = this;
		
		$.each(function(i){
			// cause we are concatenating node with array, see above difference with children method		
			elems[i] = DOM.getAncestorBy($[i]);
		});

		elems = $.unique(elems);
		
		// we wipe first, so we reduce 'this' length for easy looping to match with elems
		$.wipe(elems.length);
		
		$.each(function(i){
			$[i] = elems[i];
		});

		return $;
	},
	
	find: function(selector) {
		var elems = [],
			$ = this;

		$.each(function(i){
			elems = elems.concat(SELECT(selector, $[i]));
		});
		
		elems = $.unique(elems);
		
		// we wipe first, so we reduce 'this' length for easy looping to match with elems
		$.wipe(elems.length);
		
		$.each(function(i){
			$[i] = elems[i];
		});

		return $;
	},
	
	next: function(){
		var $ = this,
			nS = DOM.getNextSibling($[0]);
			
		if (nS) {
			$.wipe(1);
			$[0] = nS; 
		}
		else
			$.wipe();
			
		return $;
	},
	
	prev: function(){
		var $ =this,
			pS = DOM.getPreviousSibling($[0]);

		if (pS) {
			$.wipe(1);
			$[0] = pS; 
		}
		else
			$.wipe();
		return $;
	},
	
	css : function(o, o2) {
		var $ = this;
		if (isObj(o)) {
			//set style can accept an array of obj
			for (p in o) {
				//alert(p);
				//alert(o[p]);
				DOM.setStyle($ , p , o[p]);
			}
		}
		else if (isStr(o2)) {
			DOM.setStyle($ , o , o2) 
		}
		
		else if (isStr(o))
			return DOM.getStyle ($[0], o);

		return $;		
	},
	
	bind: function(type, fn) {
		EVENT.addListener(this, type, function(e) {
			// mimicking jQuery return false
			if (fn.call(this, e) === false)
				EVENT.stopEvent(e);
		});
		return this;
	},
	/*
	live: function(type, fn) {
		var yShort = this;
		EVENT.addListener(document, type, function(e){
			var obj = e.target || e.srcElement;
			if(yShort.is(yShort.selector, obj))
				fn.call(obj, e);
		});
		
		return this;
	},*/
	width: function(o) {
		var $ = this;
		if (isStr(o)) {
			$.css({width: o});
			return $;
		}
		else if(o) {
			o = parseInt(o) + "px";
			$.css({width: o});
			return $;
		}
		
		return $[0].clientWidth || false;
	},
	
	height: function(o) {
		var $ = this;
		if (isStr(o)) {
			$.css({height: o});
			return $;
		}
		else if(o) {
			o = parseInt(o) + "px";
			$.css({height: o});
			return $;
		}
		
		return $[0].clientHeight || false;
	},
	
	attr: function(prop, val) {
		var $ = this,
			el;
		if (isObj(prop)) {
			$.each(function(i){
				el = new YAHOO.util.Element($[i]);
				el.setAttributes(prop);
				delete el;
			});
		}
		else if (val)
			$.each(function(i){
				el = new YAHOO.util.Element($[i]);
				el.set(prop,val);
				delete el;
			});
		else if (prop){
			el = new YAHOO.util.Element($[0]);
			return el.get(prop);
		}

		return $;
	},
	/*attr: function(prop, val) {
		var special = /href|src|style/.exec(prop);
		var safe = /id||style/.exec(prop)
		var el;
		if (!val && isStr(prop)) {
			el = new ELEMENT(this[0]);
			console.log(el);
		}/*
		else {
		el.addClass('terjlkerjt');
		console.log(el);
		delete el;*/
		
		//x.setAttribute(prop, val);
		
		
		//if (isStr(prop)) {
		/*var isEvent = /^on/.exec(prop);
		if (isEvent) {
			for(var i=0; i<this.length;i++) 
				this[prop]= val;
		}*/
		
		/*
		else */
		
		
		// we don't support style for attr() use css() please
		/*
		if (prop == "style") {
			// do nothing
		}
		// getting values
		else if (!val && isStr(prop)) {
			this[0].getAttribute(prop)
		}
		// setting values
		else if (isStr(val) && isStr(prop)) {
			if (prop == 'class') prop = 'className';
				for(var i=0; i<this.length;i++) 
					this[i][prop]= val;
		}
		// looping through all the different values
		else if (isObj(prop) && !val) {
			for (p in prop) {
				DOM.setStyle(this , p , prop[p]);
			}
		}
		*/
		/*
		if (isStr(prop)) {
			if (!val) {
				return this[0].getAttribute(prop);
			}
			else {
				if (prop == "style") { return this } // use .css() instead 
				else if (prop == "class") { 
					for(var i=0; i<this.length; i++)
						this[i].className = val;
				}
				else { 
					for(var i=0; i<this.length; i++)
						this[prop]=val;	
				}
			}
		}
		else if(isObj(prop)) {
			for (p in prop)
				this.attr(p, prop[p]);
		}
		
		return this;
	},*/
	
	appendTo: function(o) {
		var result,
			$ = this;
		if (isNode(o))
			result = o;
		else if(isStr(o))
			result = SELECT(o)[0];

		if (result) {
			$.each(function(i){
				result.appendChild($[i]);
			});
		}
		
		return $;
	},
	
	extend: function(o, o2) {
		var temp = {};
		temp = o;
		if (o2)
			for (prop in o2) 
				temp[prop] = o2[prop]
		
		return temp;
	},
	
	ajax: function(o) {

		var opts = this.extend({
			cache: true,
			data: null,
			type: 'GET',
			url: '/'
		}, o);
		
		if(this.trim(opts.type) == 'GET') {
			opts.url += '?' + opts.data;
		}
		
		var callback = {
			success: function(o){ opts.success.call(document, o.responseText)},
			failure: opts.error,
			cache: opts.cache
		}
		var transaction = CONNECT.asyncRequest(opts.type, opts.url, callback, opts.data); 
			
		return this;
	},
	
	serialize: function() {
		var temp = '';
		for (var i=0; i<this.length; i++)
			if (this[i].name)
				temp += this[i].name + '=' + this[i].value + '&';
		// rtrim the & symbol
		return temp.substring(0, temp.length-1);
	},
	/*
	insertBefore: function(o) {
		var result;
		if (isNode(o)) {
			result = o;
		}
		else {
			result = SELECT(o)[0];
			console.log(result)
		}
		
		result.insertBefore(y,z)
		for(var i=0; i<this.length;i++)
			result.appendChild(this[i]);
		
		return this;
	}*/
	
	/*prependTo: function(o){
		var result;
		if (isNode(o)) {
			result = o;
		}
		else {
			result = SELECT(o)[0];
			//console.log(result)
		}
		
//		for(var i=0; i<this.length;i++)
//			result.appendChild(this[i]);
		console.log(result.firstChild);
		for(var i=this.length-1; i>=0;i--)
			result.insertBefore(this[i], result.firstChild);
			
		return this;
	},*/
	/*append: function(o) {
		if (isHTML(o)) {
			alert("ran append");
			this[0].innerHTML += o;
		}
		/*var result = SELECT(o)[0];
		for(var i=0; i<this.length;i++)
			result.appendChild(this[i]);
		
		return this;
	},*/
	/*
	namespace: function(name) {
		if (name) {
		    name=name.split(".");
			if (!typeof name[0] == 'Object')
				eval('window.' + name[0] + '= {}');
		    var ns = win;
		    for (var i =0; i<name.length; i++) {
		    	var nm = name[i];
				ns = ns[nm] || ( ns[nm] = {} ); 
			}
		}
	},
	*/
	trim: function( text ) {
		return (text || "").replace( /^\s+|\s+$/g, "" );
	}
}

yQ.fn.init.prototype = yQ.fn;

})(); //end anon