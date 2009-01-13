(function(){
/*!
 * yShort 0.1 
 * http://github.com/kltan/yshort/tree/master
 * A really short way to write YUI
 * Licensed under the MIT, BSD or GPL, choose a license that suits your needs
 * Copyright 2008 Kean Loong Tan
 * Start date: 2008-12-17
 * Last update: 2009-01-12
 */
 
var doc = document,
	win = window,
	UT = win.YAHOO.util,
	DOM = UT.Dom,
	EV = UT.Event,
	CON = UT.Connect,
	SEL = win.Sizzle || UT.Selector.query,
	EL = UT.Element,
	FIL = function(qry, o){	return win.Sizzle ?	win.Sizzle.filter(o, qry): UT.Selector.filter(qry, o); },
	isFn = function(o) { return typeof o === "function" },
	isStr = function(o) { return typeof o === "string" },
	isObj = function(o) { return typeof o === "object" },
	isNode = function(o) { return o.nodeType; },
	isHTML = function(o) { return /^[^<]*(<(.|\s)+>)[^>]*$/.exec(o) },
	get1stNode = function(o) { 
		return isNode(o) ? o : SEL(o)[0];
	};

var shortCuts = UT.Shortcuts = {
	DOM: DOM,
	EV: EV,
	CON: CON,
	SEL: SEL,
	EL: EL,
	GET: UT.Get
}

// yS for internal use 
// YAHOO.util.Short for global use
var yS = UT.Short = function( qry, context ) {
	// Constructor
	return new (yS.fn).init( qry, context );
};

yS.fn = yS.prototype = {
	// version number and also for yShort object detection
	yShort: '0.1',
	//animStack: [],
	// length of array of nodes
	length: null,
	// live event functions
	liveStack: [],
	// the selector that was used to create this yshort obj
	selector: null,
	// initial CSS qry that was passed to init
	//qry: null,
	
	// constructor
	init: function(qry, context) {
		var $ = this,
			context = context || doc;
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
		// if object
		else if (isObj(qry)) {
			for(var i =0; i<qry.length; i++)
				$[i] = qry[i];
			$.length = qry.length;
			$.selector = qry.selector;
		}
		// if function is passed, this before isHTML as it will also evaluate true
		else if (isFn(qry)) {
			EV.onDOMReady(function(){ 
				// on dom ready, we call the qry function and pass document as this, yShort as it's first argument
				qry.call(doc, yS, shortCuts);
			});
		}		
		// if HTML
		else if (isHTML(qry)) {
			var x = doc.createElement('YSHORT');
			x.innerHTML= qry;
			$[0] = x;
			$.length=1;
		}
		
		// if CSS query
		else if (isStr(qry)) {
			$.selector = qry;
			var result = SEL(qry, context);
			for (var i=0; i < result.length; i++)
				$[i] = result[i];
			$.length = result.length;
		}
		
		return $;
	},
	
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
	
	get: function(num) {
		return (num === 0 || num) ? [].slice.call(this, num, num+1) : [].slice.call(this);
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

		if (str === 0 || str) 
			$.each(function(i){	$[i].innerHTML = str; });
		else 
			return $[0].innerHTML;
			
		return $;
	},
	
	val: function(str) {
		var $ = this;
		if (str==='' || String(str).length)
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
	
	// we just pass this to the selector filter and wrap them in :not
	not: function(qry) {
		var $ = this;
		var els = FIL($, ":not("+qry+")");
		$.wipe(els.length);
		$.each(function(i){ $[i] = els[i]; });
		$.length = els.length;
		
		return $;
	},
	
	add: function(qry) {
		var els = [], 
			$ =this;

		if (isNode(qry))
			els[0] = qry;
		else if (isObj(qry))
			for (var i=0; i<qry.length; i++)
				els[i] = qry[i];
		else
			els = SEL(qry) || [];
			
		for(var i=$.length; i<$.length+els.length; i++)
			$[i] = els[i-$.length];
			
		$.length += els.length;
		
		return $;
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
			els[i] = $[i].parentNode;
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
	
	css: function(o, o2) {
		var $ = this;
		if (isObj(o)) {
			for (p in o) {
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
	
	data: function(key,value) {
		var $ =this;
		if (value)
			$.each(function(i){
				if(!$[i].yshortdata) $[i].yshortdata = [];
				$[i].yshortdata[key] = value;
			});
		else if (key)
			return $[0].yshortdata[key];
			
		return $;
	},
	
	removeData: function(key) {
		var $ = this;
		$.each(function(i){
			if($[i].yshortdata) {
				if(key) 
					delete $[i].yshortdata[key];
				else
					delete $[i].yshortdata;			
			}
		});

		return $;
	},
	
	bind: function(type, fn) {
		var tmp = type.split(' '),
			$ = this;
		for (var i=0; i< tmp.length; i++) {
			//tmp[i] = $.trim(tmp[i]);
			if(tmp[i]) {
				EV.addListener($, tmp[i], fn);/*function(e) {
					// mimicking jQuery return false
					if (fn.call(this, e) === false)
						EV.stopEvent(e);
					// console.log(EV.getListeners(this, 'click'));
				});*/
			}
		}
		return $;
	},
	
	unbind: function(type, fn) {
		var tmp = type.split(' '),
			$ = this;
		for (var i=0; i< tmp.length; i++) {
			//tmp[i] = $.trim(tmp[i]);
			if(tmp[i]) {
				EV.removeListener($, tmp[i], fn);
			}
		}
		return $;
	},
	
	 
	// reasons for beta,
	// can't use dom obj, i failed guys
	live: function(type, fn) {
		var $ = this,
			idx = fn.toString().substr(0, 50);

		$.liveStack[idx] = function(e){
			var obj = e.target || e.srcElement;
			if($.is($.selector, obj))
				fn.call(obj, e);
		};
		
		EV.addListener(doc, type, $.liveStack[idx]);
		
		return $;
	},
	
	die: function(type, fn) {
		var $ = this,
			idx = fn.toString().substr(0, 50);
		
		EV.removeListener(doc, type, $.liveStack[idx]);
		
		return $;
	},	
	
	dimension: function(o, type) {
		var $ = this,
			obj = {};
			
		// detect if string or int
		obj[type] = isStr(o) ? o: parseInt(o) + "px";
		
		if (o) {
			$.css(obj);
			return $;
		}
		
		type = 'client'+ type.substr(0,1).toUpperCase() + type.substr(1,type.length);
		return $[0][type] || false;
	},
	
	// return width as calculated by browser
	width: function(o) {
		return this.dimension(o, 'width');
	},
	
	// return height as calculated by browser
	height: function(o) {
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
	
	appendTo: function(o) {
		var tmp = get1stNode(o),
			$ = this;

		if (tmp) {
			$.each(function(i){
				if ($[i].tagName== 'YSHORT') {
					while($[i].childNodes.length)
						tmp.appendChild($[i].childNodes[0]);
				}
				else
					tmp.appendChild($[i]);
			});
		}
		
		return $;
	},
	
	prependTo: function(o) {
		var tmp = get1stNode(o),
			$ = this;

		if (tmp) {
			var first = tmp.firstChild;
			$.each(function(i){
				if ($[i].tagName== 'YSHORT') {
					while($[i].childNodes.length)
						tmp.insertBefore($[i].childNodes[0], first);
					
				}
				else
					tmp.insertBefore($[i],first);
			});
		}
		
		return $;
	},
	
	insertBefore: function(o){
		var tmp = get1stNode(o),
			$ = this;

		if (tmp) {
			var parent = tmp.parentNode;
			$.each(function(i){
				if ($[i].tagName== 'YSHORT') {
					while($[i].childNodes.length)
						parent.insertBefore($[i].childNodes[0], tmp);
				}
				else {
					parent.insertBefore($.next($[i]), tmp);
				}
			});
		}
		return $;
	},
	
	insertAfter: function(o){
		var tmp = get1stNode(o),
			$ = this;
		
		if (tmp) {
			var parent = tmp.parentNode,
				next = tmp.nextSibling;
			$.each(function(i){
				if ($[i].tagName== 'YSHORT') {
					while($[i].childNodes.length)
						parent.insertBefore($[i].childNodes[0], next);
				}
				else {
					parent.insertBefore($[i], next);
				}
			});
		}
		return $;
	},
	
	clone: function(){
		var $ = this,
			node = $[0].cloneNode(true);
		
		$.wipe(1);
		$[0] = node;
		
		return $;
	},
	
	// extend (o,o2,o3,o4,o5 .......)
	extend: function(o) {
		for ( var i = 0; i < arguments.length; i++ ) 
			for ( var key in arguments[i] ) 
			  o[key] = arguments[i][key]; 
		return o;
	},
	
	// remap YAHOO's asyncRequest
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
			loading: function(o){ opts.loading.call(doc, o.responseText); },
			success: function(o){ opts.success.call(doc, o.responseText); },
			failure: function(o){ opts.error.call(doc, o.responseText); },
			cache: opts.cache
		}
		
		CON.startEvent.subscribe(callback.loading, callback);
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
		return this;
	},
	
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
		myAnim.animate();
		if (fn)
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
		
	fadeColor: function(o, dur){
		var $ = this;
		duration = dur/1000 || 1;
		if (isObj(o)) {
			$.each(function(i){
				var anim = new UT.ColorAnim($, o, duration);
				anim.animate();
			});
		}
		return $;
	}
}

yS.fn.init.prototype = yS.fn;

})(); //end anon