/*!
 * yShort 0.1 
 * http://github.com/kltan/yshort/tree/master
 * A really short way to write YUI
 * Licensed under the MIT, BSD or GPL, choose a license that suits your needs
 * Copyright 2009 Kean Loong Tan
 * Start date: 2008-12-17
 * Last update: 2009-02-02
 */

(function(){
var doc = document,
	win = window,
	UT = win.YAHOO.util,
	DOM = UT.Dom,
	EV = UT.Event,
	CON = UT.Connect,
	SEL = win.Sizzle || UT.Selector.query,
	EL = UT.Element,
	FIL = function(o, qry){	return win.Sizzle ?	win.Sizzle.filter(qry, o): UT.Selector.filter(o, qry); }, // rigged to use either YUI selector or Sizzle
	isFn = function(o) { return typeof o === "function" },
	isStr = function(o) { return typeof o === "string" },
	isObj = function(o) { return typeof o === "object" },
	isArray = function(o){ return toString.call(obj) === "[object Array]" }, // pretty stable
	isNode = function(o) { return o.nodeType; }, // fastest node detection
	isHTML = function(o) { return /^[^<]*(<(.|\s)+>)[^>]*$/.exec(o) },
	get1stNode = function(o) { 	return isNode(o) ? o : SEL(o)[0]; },
	shortCuts = UT.Shortcuts = {
		DOM: DOM,
		EVENT: EV,
		CON: CON,
		SEL: SEL,
		EL: EL,
		GET: UT.Get
	};

// yS for internal use 
// YAHOO.util.Short for global use
var yS = UT.Short = function( qry, context ) {
	// Constructor
	return new yS.fn.init( qry, context );
};

yS.fn = yS.prototype = {
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
		// if object or yShort
		else if (isObj(qry)) {
			for(var i =0; i<qry.length; i++)
				$[i] = qry[i];
			$.length = qry.length;
			$.selector = qry.selector || null;
			$.previousStack = qry.previousStack || [];
		}
		// if function is passed, this runs before isHTML as it will also evaluate true
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
		
		else if (isStr(qry) && !yS.trim(qry).length) {
			$[0]=doc;
			$.length = 1;
		}
		
		// if CSS query
		else if (isStr(qry)) {
			$.selector = qry;
			var result = SEL(qry, context);
			for (var i=0; i < result.length; i++)
				$[i] = result[i];
			$.length = result.length;
		}
	},
	
	// version number and also for yShort object detection
	yShort: '0.1',
	previousStack: [],
	// length of array of nodes
	length: null,
	// the initial selector that was used to create this yshort obj
	selector: null,
		
	// iterate through all of yShorts elements
	each: function(o, fn) {
		var $ = this;
		if (fn && isFn(fn))
			for (var i=0; i < o.length; i++) {
				fn.call(o[i], i);
			}
		else if (isFn(o))
			for (var i=0; i < $.length; i++)
				o.call($[i], i);
		
		return $;
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
	
	// push in stack and wipe everything in this
	stack: function(){
		var temp = {}, $ = this;
		temp.length = $.length;
		$.each(function(i){
			temp[i] = $[i];
		});
		$.previousStack.push(temp);
		$.wipe();
		
		return temp;
	},
	
	//end pops previous stacks and put in this	
	end: function(){
		var $ = yS(this),
			temp = $.previousStack[$.previousStack.length-1];
			
		$.each(temp, function(i){
			$[i] = temp[i];	
		});
		$.wipe(temp.length);
		$.previousStack.pop();
		return $;
	},
	
	// returns the nth item in yShort
	eq: function(num){
		var $ = yS(this);

		$[0] = $.stack()[num];
		$.wipe(1);

		return $;
	},
	
	// get an array of nodes (convert jQuery into nodes)
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
		return DOM.hasClass(this[0], str);
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
		var $ = yS(this),
			els = FIL($, qry);

		$.wipe(els.length);
		$.stack();
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
		var $ = yS(this);
		var els = FIL($, ":not("+qry+")");
		$.wipe(els.length);
		$.each(function(i){ $[i] = els[i]; });
		$.length = els.length;
		
		return $;
	},
	
	add: function(qry) {
		var els = [], 
			$ = yS(this);

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
		var $ = yS(this),
			els = [];

		$.each(function(i){ 
			// cause we are concatenating array with array			
			els = els.concat(DOM.getChildren($[i]));
		});

		if (qry)
			els = FIL(els, qry);
		
		$.stack();
		
		// we wipe first, so we increase 'this' length for easy looping to match with els
		$.wipe(els.length);

		$.each(function(i){
			$[i] = els[i];
		});
			
		return $;
	},
	
	parent: function(){
		var els=[],
			$ = yS(this);

		$.each(function(i){
			// cause we are concatenating node with array, see above difference with children method		
			els[i] = $[i].parentNode;
		});
		
		$.stack();

		els = yS.unique(els);
		
		// we wipe first, so we reduce 'this' length for easy looping to match with els
		$.wipe(els.length);
		
		$.each(function(i){
			$[i] = els[i];
		});

		return $;
	},
	
	ancestors: function(str){
		var els=[],
			$ = yS(this);
			
		$.each(function(i){
			var temp = $[i];
			while(temp){
				els.push(temp);
				temp=temp.parentNode;
			}
		});

		els = FIL(els, str);
		els = yS.unique(els);
		$.stack();

		els = yS.unique(els);
		
		// we wipe first, so we reduce 'this' length for easy looping to match with els
		$.wipe(els.length);
		
		$.each(function(i){
			$[i] = els[i];
		});

		return $;
	},
	
	
	find: function(qry) {
		var els = [],
			$ = yS(this);

		$.each(function(i){
			els = els.concat(SEL(qry, $[i]));
		});
		
		$.stack();
		
		els = yS.unique(els);
		
		// we wipe first, so we reduce 'this' length for easy looping to match with els
		$.wipe(els.length);
		
		$.each(function(i){
			$[i] = els[i];
		});

		return $;
	},
	
	next: function(){
		var $ = yS(this),
			nS = DOM.getNextSibling($[0]);
		
		if (nS) {
			$.stack();
			$.wipe(1);
			$[0] = nS; 
		}
		else
			$.wipe();
			
		return $;
	},
	
	prev: function(){
		var $ = yS(this),
			pS = DOM.getPreviousSibling($[0]);

		if (pS) {
			$.stack();
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
	
	 /*
	// not implementing yet
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
	*/
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
	
	// hope for the best, my guess is that attr sucks
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
		var $ = (this),
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
	
	serialize: function() {
		var tmp = '';
		for (var i=0; i<this.length; i++)
			if (this[i].name)
				tmp += this[i].name + '=' + this[i].value + '&';
		// rtrim the & symbol
		return tmp.substring(0, tmp.length-1);
	},

	trim: function( text ) {
		return (text || "").replace( /^\s+|\s+$/g, "" );
	},
	
	// used internally for now
	animate: function(attr, milisec, fn, easing){
		var $ = this,
			sec = milisec/1000 || 1,
			ease = easing || YAHOO.util.Easing.easeNone,
			counter = 0,
			total = function(){// total adds up when a function has completed animating
				counter++;
				if (counter === $.length)
					fn.call($);
			};

		for(var i=0; i<$.length; i++) {
			// make yshortEffects expando an array if not exists
			var fx = $[i].yshortEffects = $[i].yshortEffects || [];
			// push new effects into node expando
			fx.push(new YAHOO.util.Anim($[i], attr, sec, ease));
			// animate the effects now
			fx[fx.length-1].animate();
			fx[fx.length-1].onComplete.subscribe(total);
		};
		
		return $;
	},
	 //useless because they can only be used in one instance of yShort, fix coming soon
	// stops all animation
	stop: function() {
		var $ = this;
		for(var i=0; i<$.length; i++) {
			var fx =$[i].yshortEffects;
			if(fx)
				for(var j=0; j<fx.length; j++) 
					if(fx[j])
						fx[j].stop();
		}

		return $;
	},
	// checks for animation, returns true or false
	animated: function() {
		var $ = this,
			fx = $[0].yshortEffects;
		
		if (fx)
			for (var i=0; i< fx.length; i++)
				if (fx[i].isAnimated())
					return true;

		return false;
	},
	
	// starting the animations / effects
	fadeIn: function(dur, fn, easing){
		return this.animate({opacity: { from:0, to: 1 }}, dur, fn, easing);
	},
	
	fadeOut: function(dur, fn, easing){
		return this.animate({ opacity: { to: 0 } }, dur, fn, easing);
	},

	fadeTo: function(val, dur, fn, easing){
		return this.animate({opacity: { to: val }}, dur, fn, easing);
	},
		
	fadeColor: function(attr, dur){
		var $ = this,
			duration = dur/1000 || 1,
			counter = 0,
			total = function(){// total adds up when a function has completed animating
				counter++;
				if (counter === $.length)
					fn.call(doc);
			};
		
		if (isObj(attr)) {
			$.each(function(i){
				var fx = $[i].yshortEffects = $[i].yshortEffects || [];
				fx.push(new UT.ColorAnim($[i], attr, duration));
				fx[fx.length-1].animate();
			});
		}
		
		return $;
	}
}

// drop init from list of prototypes as it's the constructor
for(prop in yS.fn) {
	if (prop != 'init')
		yS.fn.init.prototype[prop] = yS.fn[prop];
}

// define, for global ease of use
yS.extend = yS.fn.extend;

// execute to extend yShort
yS.extend(yS, {
	
	/*
	* Mimicks jQuery but not using their code
	*/
	each: yS.fn.each,
	
	/*
	* Shortest way to write make array, ownage
	*/
	makeArray: function(o){	return [].slice.call(o); },
	
	/*
	* Returns unique, whether DOM or array, pretty decent algorithm
	*/
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
	
	/*
	* Copied from jQuery
	*/
	grep: function(o, fn) {
		var arry = [];
		// Go through the array, only saving the items that pass the validator function
		for ( var i = 0; i < o.length; i++ )
			if (!fn.call(o[i], o[i], i) === false)
				arry.push( o[i] );

		return arry;
	},

	/*
	* Copied from jQuery
	*/
	inArray: function(el, o){
		// prevent ie's window == document problem
		for ( var i = 0; i < o.length; i++ )
			if ( o[i] === elem )
				return i;
		return -1;
	},

	map: function(o, fn) {
		var arry = [];
		for ( var i = 0; i < o.length; i++ ) 
			arry.push(fn.call(o[i], o[i], i));

		return arry;
	},

	merge: function(){
		var o = [];
		for ( var i = 0; i < arguments.length; i++ ) 
			o = o.concat(arguments[i]);	
		return o;
	},

	/*
	* Copied from jQuery, original copyrighted of other origin
	*/
	isArray: isArray,
	
	isFunction: isFn,
	
	/*
	* Copied from jQuery, original copyrighted of other origin
	*/
	trim: yS.fn.trim,

	/*
	* remap YUI's asyncRequest, write even shorter code, ownage
	*/
	ajax: function(o) {
		var opts = this.extend({
			cache: true,
			data: null,
			type: 'GET',
			url: '/'
		}, o);
		
		if(this.trim(opts.type) === 'GET') {
			if (opts.data)
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
	},
	
	/*
	* Even better namespace function than YUI's namespace, support root as window obj
	*/
	namespace: function(name) {
		if (name) {
			// explode namespace with delimiter
		    name=name.split(".");
			// root is window obj
		    var ns = win;
			// loop through each level of the namespace
		    for (var i =0; i<name.length; i++) {
				// nm is current level name
		    	var nm = name[i];
				// if not exist, add current name as obj to parent level, assign ns (parent) to current
				ns = ns[nm] || ( ns[nm] = {} ); 
			}
		}
	},

	/* 
	* Feature detection of major browsers, code is more future proof
	*/
	
	isIE6: function(){
		return (doc.body.style.maxHeight === undefined) ? true: false;
	},
	
	isIE7: function(){
		return (doc.all && !win.opera && win.XMLHttpRequest) ? true : false;
	},

	isIE: function(){
		return (win.ActiveXObject && doc.all) ? true: false;
	},
	
	isGecko: function(){
		return (doc.getBoxObjectFor === undefined) ? false : true;
	},
	
	isOpera: function(){
		return (win.opera) ? true : false;
	},

	isWebkit: function(){
		return (navigator.taintEnabled) ? false : true;
	}

}); // end yS.extend 
})(); //end yShort anon