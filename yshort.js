(function(){
/*!
 * yShort 0.1
 * A really short way to write YUI
 * Licensed under the MIT
 * Copyright 2008 Kean Loong Tan
 * $Date: 2008-12-17
 */
 
var doc = document,
	win = window,
	UT = YAHOO.util,
	DOM = UT.Dom,
	EV = UT.Event,
	CON = UT.Connect,
	SEL = win.Sizzle || UT.Selector.query,
	EL = UT.Element,
	FIL = function(qry, o){
		return win.Sizzle ?	win.Sizzle.filter(o, qry): UT.Selector.filter(qry, o);
	};

var isFn = function(o) { return typeof o === "function" };
var isStr = function(o) { return typeof o === "string" };
var isObj = function(o) { return typeof o === "object" };
var isNode = function(o) { return o.nodeType; };
var isHTML = function(o) { return /^[^<]*(<(.|\s)+>)[^>]*$/.exec(o) };


// yS for internal use 
// YAHOO.util.Short for global use
var yS = win.YAHOO.util.Short = function( qry, context ) {
	// Constructor
	return new (yS.fn).init( qry, context );
};

yS.fn = yS.prototype = {
	// version number and also for yShort object detection
	yShort: '0.1',
	animStack: [],
	// length of array of nodes
	length: null,
	// initial CSS qry that was passed to init
	//qry: null,
	
	// constructor
	init: function(qry, context) {
		var $ = this;
		// if empty, we just make document the our first item in array
		if (!qry) {
			$[0]=doc;
			$.length = 1;
		}
		
		// if nodes
		else if (isNode(qry)) {
			$[0] = qry;
			$.length = 1;
		}
		// if yShort object
		else if (qry.yShort) {
			for(var i =0; i<qry.length; i++)
				$[i] = qry[i];
			$.length = qry.length;
		}
		// if function is passed
		else if (isFn(qry)) {
			EV.onDOMReady(function(){ 
				// on dom ready, we call the qry function and pass document as this, yShort as it's first argument
				qry.call(doc, yS);
			});
		}		
		// if HTML
		else if (isHTML(qry)) {
			var x = document.createElement('YSHORT');
			x.innerHTML= qry;
			$[0] = x;
			$.length=1;
		}
		// if CSS query
		else if (isStr(qry)) {
			/*if (isHTML(qry)) {
				var x = document.createElement('P');
				//x.innerHTML = qry;
				//alert(x.firstChild);
				//this[0]=document;
				//this[0]=x.firstChild;
				this.length = 0;
				//if (this[0].nodeType )
			}
			else {*/
				var result = SEL(qry);
				for (var i=0; i < result.length; i++)
					$[i] = result[i];
				$.length = result.length;
				//$.qry = qry;
				//alert("AS");
			//}
		}
		
		return $;
	},
	
	/*forAll: function(fn) {
		for(var i=0; i< this.length; i++)
			fn.call(this[i]);
	},*/
	
	// iterate through all of yShorts elements
	each: function(fn) {
		var $ = this;
		if (isFn(fn)) 
			for (var i=0; i < $.length; i++) {
				fn.call($[i], i);
			}
		return $;
	},
	
	// returns a unique set of array
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
	
	// destroys elements on and after array[n]
	wipe: function(n) {
		var $ = this;
		n = n || 0;
		// we cannot use each cause  i = n
		for (var i = n; i < $.length; i++)
			delete $[i];

		$.length = n;
	},
	
	// returns the nth item in yShort
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
		var $ = this;

		if (String(str).length) 
			$.each(function(i){	$[i].innerHTML = str; });
		else 
			return $[0].innerHTML;
			
		return $;
	},
	
	val: function(str) {
		var $ = this;
		if (String(str).length)
			$.each(function(i){
				$[i].value = str;
			});

		else
			return $[0].value;
			
		return $;
	},
	
	filter: function(qry) {
		var $ = this,
			els = FIL($, qry);

		$.wipe(els.length);
		$.each(function(i){ $[i] = els[i] });
	
		return $;
	},
	
	is: function(qry, obj) {
		var o = [];
		if (obj) {o[0] = obj }
		else { o = this; }
		var els = FIL(o, qry);

		return els.length ? true: false;
	},
	
	// we just pass this to the qry filter and wrap them in :not
	not: function(qry) {
		var $ = this;
		var els = FIL($, ":not("+qry+")");
		$.wipe(els.length);
		$.each(function(i){ $[i] = els[i]; });
		$.length = els.length;
		
		return $;
	},
	
	add: function(qry) {
		var els = SEL(qry) || [];
		for(var i=this.length; i<this.length+els.length; i++)
			this[i] = els[i-this.length];
			
		this.length += els.length;
		
		return this;
	},
	
	children: function(qry) {
		var $ = this,
			els = [];

		$.each(function(i){ 
			// cause we are concatenating array with array			
			els = els.concat(DOM.getChildren($[i]));
		});

		if (qry)
			els = FIL(els, qry);
			
		// we wipe first, so we increase 'this' length for easy looping to match with els
		$.wipe(els.length);

		$.each(function(i){
			$[i] = els[i];
		});
			
		return $;
	},
	
	parent: function(){
		var els=[],
			$ = this;
		
		$.each(function(i){
			// cause we are concatenating node with array, see above difference with children method		
			els[i] = els[i].parentNode;
		});

		els = $.unique(els);
		
		// we wipe first, so we reduce 'this' length for easy looping to match with els
		$.wipe(els.length);
		
		$.each(function(i){
			$[i] = els[i];
		});

		return $;
	},
	
	find: function(qry) {
		var els = [],
			$ = this;

		$.each(function(i){
			els = els.concat(SEL(qry, $[i]));
		});
		
		els = $.unique(els);
		
		// we wipe first, so we reduce 'this' length for easy looping to match with els
		$.wipe(els.length);
		
		$.each(function(i){
			$[i] = els[i];
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
		EV.addListener(this, type, function(e) {
			// mimicking jQuery return false
			if (fn.call(this, e) === false)
				EV.stopEvent(e);
		});
		return this;
	},
	
	/*
	live: function(type, fn) {
		var yShort = this;
		EV.addListener(document, type, function(e){
			var obj = e.target || e.srcElement;
			if(yShort.is(yShort.qry, obj))
				fn.call(obj, e);
		});
		
		return this;
	},*/
	dimension: function(o, type) {
		var $ = this,
			obj = {};
			// detect if string or int

		obj[type] = isStr(o) ? o: parseInt(o) + "px";
		
		if (o) {
			$.css(obj);
			return $;
		}
		
		type = type.substr(0,1).toUpperCase() + type.substr(1,type.length)
		return $[0]['client'+type] || false;
	},
	
	// return width as calculated by browser
	width: function(o) {
		/*var $ = this;
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
		*/
		
		return this.dimension(o, 'width');
	},
	
	// return height as calculated by browser
	height: function(o) {
		/*var $ = this;
		if (isStr(o)) {
			$.css({height: o});
			return $;
		}
		else if(o) {
			o = parseInt(o) + "px";
			$.css({height: o});
			return $;
		}
		
		return $[0].clientHeight || false;*/
		return this.dimension(o, 'height');
	},
	
	// hope for the best, my guess is that it sucks
	attr: function(prop, val) {
		var $ = this,
			el;
		// if prop is obj, we disregard val
		if (isObj(prop)) {
			$.each(function(i){
				el = new EL($[i]);
				el.setAttributes(prop);
				delete el;
			});
		}
		// if prop is not obj and val exists
		else if (val)
			$.each(function(i){
				el = new EL($[i]);
				el.set(prop,val);
				delete el;
			});
			
		// if prop does exists
		else if (prop){
			el = new EL($[0]);
			var tmp = el.get(prop);
			delete el;
			return tmp;
		}

		return $;
	},
	/*attr: function(prop, val) {
		var special = /href|src|style/.exec(prop);
		var safe = /id||style/.exec(prop)
		var el;
		if (!val && isStr(prop)) {
			el = new EL(this[0]);
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
		var tmp,
			$ = this;
		if (isNode(o))
			tmp = o;
		else if(isStr(o))
			tmp = SEL(o)[0];

		if (tmp) {
			$.each(function(i){
				
				if ($[i].tagName== 'YSHORT') {
					var lengths = $[i].childNodes.length;
					for(var j=0; j<lengths; j++)
						tmp.appendChild($[i].childNodes[0]);
				}
				else
					tmp.appendChild($[i]);
			});
		}
		
		return $;
	},
	
	prependTo: function(o) {
		var tmp,
			$ = this;
		if (isNode(o))
			tmp = o;
		else if(isStr(o))
			tmp = SEL(o)[0];

		if (tmp) {
			$.each(function(i){
				
				if ($[i].tagName== 'YSHORT') {
					var lengths = $[i].childNodes.length,
						first = tmp.firstChild;
					for(var j=0; j<lengths; j++)
						tmp.insertBefore($[i].childNodes[0], first);
				}
				else {
					var first = tmp.firstChild;
					tmp.insertBefore($[i],first);
				}
			});
		}
		
		return $;
	},
	
	insertBefore: function(o){
		var tmp,
			$ = this;
		if (isNode(o))
			tmp = o;
		else if(isStr(o))
			tmp = SEL(o)[0];

		if (tmp) {
			$.each(function(i){
			
			});
		}
	},
	
	insertAfter: function(){
		
	},
	
	extend: function(o) {
		for ( var i = 0; i < arguments.length; i++ ) 
			for ( var key in arguments[i] ) 
			  o[key] = arguments[i][key]; 
		return o;
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
		var transaction = CON.asyncRequest(opts.type, opts.url, callback, opts.data); 
			
		return this;
	},
	
	serialize: function() {
		var tmp = '';
		for (var i=0; i<this.length; i++)
			if (this[i].name)
				tmp += this[i].name + '=' + this[i].value + '&';
		// rtrim the & symbol
		return tmp.substring(0, tmp.length-1);
	},
	/*
	insertBefore: function(o) {
		var result;
		if (isNode(o)) {
			result = o;
		}
		else {
			result = SEL(o)[0];
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
			result = SEL(o)[0];
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
		/*var result = SEL(o)[0];
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
	},
	
	// used internally for now
	animate: function(type,milisec,val,easing,fn){
		var attr = {},
			$ = this,
			sec = milisec/1000 || 1,
			ease = easing || YAHOO.util.Easing.easeNone;
		switch(type) {
			case 'fadeTo': 
				attr = {opacity: { to: val }};
				break;    
			case 'fadeIn':
				attr = {opacity: { from:0, to: 1 }};
				break;
			case 'fadeOut':
				attr = { opacity: { to: 0 } };
				break;
			default:
				attr = type;
				break;
		}
		
		var myAnim = new YAHOO.util.Anim(this, attr, sec, ease);
		//$.animStack.push(myAnim);
		myAnim.animate();
		myAnim.onComplete.subscribe(fn);
		
		return $;
	},
	/* useless because they can only be used in one instance of yShort, fix coming soon
	// stops all animation
	stop: function() {
		var $ = this;
		for (var i=0; i< $.animStack.length; i++)
			$.animStack[i].stop();
		
		$.animStack = [];
		
		return $;
	},
	// checks for animation, returns true or false
	animated: function() {
		var $ = this;
		for (var i=0; i< $.animStack.length; i++)
			if ($.animStack[i].isAnimated())
				return true;
		
		return false;
	},
	*/
	
	// starting the animations / effects
	fadeIn: function(milisec, fn, easing){
		return this.animate('fadeIn', milisec, null, easing, fn);
	},
	
	fadeOut: function(milisec, fn, easing){
		return this.animate('fadeOut', milisec, null, easing, fn);
	},

	fadeTo: function(val, milisec, fn, easing){
		return this.animate('fadeTo', milisec, val, easing, fn);
	},

	hide: function(){
		return this.css({display:'none'});
	},
	
	show: function(){
		var $ = this;
		if ($.css('display') == 'none')
			$.css({display:''});
		if ($.css('visibility') == 'hidden')
			$.css({visibility:'visible'});
		return $;
	},
	
	transitColor: function(o, dur){
		var $ = this;
		duration = dur/1000 || 1;
		if (isObj(o)) {
			$.each(function(i){
				var anim = new YAHOO.util.ColorAnim(this, o, duration);
				anim.animate();
				$.animStack.push(anim);
			});
		}
		return $;
	}
}

yS.fn.init.prototype = yS.fn;

})(); //end anon