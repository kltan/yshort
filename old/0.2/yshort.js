/*!
 * yShort 0.2 
 * http://github.com/kltan/yshort/tree/master 
 * A really short way to write YUI 2.6.x - 2.7.x 
 * Dual licensed under the MIT and BSD 
 * Copyright 2008-2009 Kean Tan 
 * Start date: 2008-12-17
 * Last build: 2009-03-3 03:01:59 PM 
 */

(function(){

// caching of even natives to improve reference speed in non-JIT bytecode javascript engines
var doc = document,
	win = window,
	nav = navigator,
	undefined, // speeding up undefined
	myToString = Object.prototype.toString, // type detection function call
	myPush = Array.prototype.push,
	UT = win.YAHOO.util, // YAHOO.util
	DOM = UT.Dom, // YAHOO.util.Dom
	EV = UT.Event, // YAHOO.util.Event
	CON = UT.Connect, // YAHOO.util.Connect
	SEL = function(qry, context){ return win.Sizzle ? win.Sizzle(qry, context) : UT.Selector.query(qry, context)}, // Sizzle or YAHOO.util.Selector.query
	EL = UT.Element, // YAHOO.util.Element
	FIL = function(o, qry){	return win.Sizzle ?	win.Sizzle.filter(qry, o): UT.Selector.filter(o, qry); },
	
	// check for types
	isFn = function(o) { return typeof o === "function" },
	isStr = function(o) { return typeof o === "string" },
	isObj = function(o) { return typeof o === "object" }, // array is also detected as object
	isNode = function(o) { return o.nodeType; }, // fastest node detection, unreliable
	isHTML = function(o) { return /^<(.|\s)+>$/.test(o) }, // lazy HTML detection, unreliable
	
	// some internal properties
	get1stNode = function(o) { 	return isNode(o) ? o : SEL(o)[0]; }, // yShort internal method
	yshortdata = 'yshortdata', // for data() use
	yshorteffects ='yshorteffects', // for animate() use
	
	// remapping some YUI namespace
	shortcuts = YAHOO.util.Shortcuts = {
		DOM: DOM, // Y.DOM -> YAHOO.util.Dom
		EVENT: EV, // Y.EVENT -> YAHOO.util.Event
		CONNECT: CON, // Y.CONNECT -> YAHOO.util.Connect
		QUERY: SEL, // Y.QUERY -> YAHOO.util.Selector.query
		EL: EL,  // Y.ELEMENT -> YAHOO.util.Element
		GET: UT.Get // Y.GET -> YAHOO.util.Get
	};

// yS for internal use 
// YAHOO.util.Short for global use
var yS = UT.Short = win.yShort = function( qry, context ) {
	// Constructor
	return new yS.fn.init( qry, context );
};

yS.fn = yS.prototype = {
	// constructor, determines what to do with the query passed in
	init: function(qry, context) {
		context = context || doc;
		qry = qry || doc;
		
		// if DOM node
		if (isNode(qry)) {
			this[0] = qry;
			this.length = 1;
		}
		
		// if String
		else if (isStr(qry)) {
			// if HTML, create nodes from it and push into yShort object, then we can manipulate the nodes with yShort methods
			if (isHTML(qry)) {
				var c = 0,
				x = doc.createElement('YSHORT');
				x.innerHTML= qry;
	
				for (var i=0; i< x.childNodes.length; i++) {
					if(x.childNodes[i].nodeType === 1) {
						this[c] = x.childNodes[i];
						c++;
					}
				}
				this.length=c;
			}
			else {
				// if CSS query
				this.selector = qry;
				var result = SEL(qry, context);
				for (var i=0; i < result.length; i++)
					this[i] = result[i];
				this.length = result.length;
			}
		}
		
		// if array, object or yShort object
		else if (isObj(qry)) {
			// if not array or yShort object, we need it to be an array
			if (!qry.length)
				qry = yS.makeArray(qry);

			for(var i =0; i<qry.length; i++)
				this[i] = qry[i];
			this.length = qry.length;
			this.selector = qry.selector || null;
		}
		
		// if function is passed, this runs before isHTML as it will also evaluate true
		// onDOMready, we call the qry function and pass window object as the calling object, 
		// YAHOO.util.Short as it's first argument and YAHOO.util.Shortcuts as second
		else if (isFn(qry)) {
			EV.onDOMReady(function(){ 
				qry.call(win, yS, shortcuts);
			});
		}
		
		// things added/created in init constructor is a new instance
		this.previousStack = [];
	},
	
	/****************************************************************
	 * all the members below are shared amongs all yShort objects,  *
	 * you change one, they affect ALL YAHOO.util.Short objects     *
	 ****************************************************************/
	
	// version number and also for yShort object detection
	yShort: '0.2',
	// numbers of nodes inside current yShort obj
	length: null,
	// the initial selector that was used to create this yshort obj, useful for live and die
	selector: null,
	// iterate through all of yShorts elements or o's elements
	each: function(o, fn) {
		// for performance, no vigorous check, let there be errors if user pass something out of the ordinary
		if (!fn)
			for (var i=0; i < this.length; i++)
				o.call(this[i], i, this[i]);
		//
		else {
			if (!o.yShort && yS.isObject(o))
				o = yS.makeArray(o); // if not array or yShort object, we need it to be an array
			for (var i=0; i < o.length; i++)
				fn.call(o[i], i, this[i]);
		}
		return this;
	},
	
	// destroys elements on and after array[n]
	wipe: function(n) {
		n = n || 0;
		// we cannot use each cause  i = n
		for (var i = n; i < this.length; i++)
			delete this[i];

		this.length = n;
		return this;
	},
	
	// push in stack
	stack: function(prev){
		this.previousStack.push(prev);
		return this;
	},
	
	//end pops previous stacks and put in this	
	end: function(){
		return this.previousStack[0];
	},
	
	// returns the nth item in yShort
	eq: function(num){
		var $ = yS(this);
		num = num || 0; // if none is specified, we return the first element

		$[0] = this[num];
		
		$.stack(this).wipe(1);

		return $;
	},
	
	// get an array of nodes (convert yShort object into an Array)
	get: function(num) {
		return (num === undefined) ? Array.prototype.slice.call(this) : this[num];
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
		for (var i=0; i< this.length; i++)
			DOM.hasClass(this[i], str)? DOM.removeClass(this[i], str) : DOM.addClass(this[i], str);

		return this;
	},
	
	replaceClass: function(str, str2) {
		DOM.replaceClass(this, str, str2);
		return this;
	},
	
	generateId: function(prefix) {
		DOM.generateId(this, prefix);
		return this;
	},
	
	getRegion: function(){
		return DOM.getRegion(this[0]);
	},
	
	// manipulate innerHTML of nodes or return innerHTML of first node
	html: function(str) {
		if (str === 0 || str) 
			for (var i=0; i< this.length; i++)
				this[i].innerHTML = str; 
		else 
			return this[0].innerHTML;
			
		return this;
	},
	
	// manipulate value of nodes or return value of first node
	val: function(str) {
		// stringent check on integer or empty string to prevent 0 as being detected as false
		if (yS.isNumber(str) || yS.isString(str))
			for (var i=0; i< this.length; i++)
				this[i].value = str;
		else
			return this[0].value;
			
		return this;
	},
	
	// filter current nodes based on the CSS rules
	filter: function(qry) {
		var $ = yS(this),
			els = FIL($, qry);
		// wipe plus reset length
		$.stack(this)
		 .wipe(els.length);
		 
		for (var i=0; i< $.length; i++)
			$[i] = els[i];
	
		return $;
	},
	
	is: function(qry, obj) {
		var o = [];
		if (obj) {o[0] = obj }
		else { o = this; }

		var els = FIL(o, qry);

		return els.length ? true: false;
	},
	
	// TODO: stack not, so we can end
	// just pass this to the selector filter and wrap them in :not
	not: function(qry) {
		var $ = yS(this);
		var els = FIL($, ":not("+qry+")");
		
		$.stack(this)
			.wipe(els.length);
		
		for (var i=0; i< $.length; i++)
			$[i] = els[i];
			
		return $;
	},
	
	add: function(qry) {
		var els = [], 
			$ = yS(this);

		if (isNode(qry))  // you can add a node
			els[0] = qry;
		else if (isObj(qry)) { // a yshort object, array or object
			// if not yshort object and is object, convert to array
			if (!qry.yshort && yS.isObject(qry)) 
				qry = yS.makeArray(qry);
			for (var i=0; i<qry.length; i++)
				els[i] = qry[i];
		}
		else
			els = SEL(qry) || [];
		
		$.stack(this);
		
		// adding to the length
		for(var i=$.length; i<$.length+els.length; i++)
			$[i] = els[i-$.length];
			
		$.length += els.length;
		
		return $;
	},
	
	children: function(qry) {
		var $ = yS(this),
			els = [];

		// cause we are concatenating array with array			
		for (var i=0; i< $.length; i++)
			els = els.concat(DOM.getChildren($[i]));

		if (qry)
			els = FIL(els, qry);
		
		// we wipe first, so we increase 'this' length for easy looping to match with els
		$.stack(this)		
		 .wipe(els.length);
		 
		
		for (var i=0; i< $.length; i++)
			$[i] = els[i];
			
		return $;
	},
	
	parent: function(){
		var els=[],
			$ = yS(this);
		
		// cause we are concatenating node with array, see above difference with children method		
		for (var i=0; i< $.length; i++)
			els[i] = $[i].parentNode;
		
		els = yS.unique(els);
		
		// we wipe first, so we reduce 'this' length for easy looping to match with els
		$.stack(this)
		 .wipe(els.length);
		 
		for (var i=0; i< $.length; i++)
			$[i] = els[i];

		return $;
	},
	// TODO: rewrite ancestors so that i doesn't required have to be filtered by str 
	ancestors: function(str){
		var els=[],
			$ = yS(this);
		
		if (str) {	
			for (var i=0; i< $.length; i++) {
				var temp = $[i];
				while(temp){
					els.push(temp);
					temp=temp.parentNode;
				}
			};
	
			els = FIL(els, str);
			els = yS.unique(els);

			// we wipe first, so we reduce 'this' length for easy looping to match with els
			$.stack(this)
			 .wipe(els.length);
			 
			for (var i=0; i< $.length; i++)
				$[i] = els[i];
		
		}
		else {
			$.stack(this)
			 .wipe(els.length);
		}

		return $;
	},
	
	// TODO: decrease usage of each
	find: function(qry) {
		var els = [],
			$ = yS(this);

		els = SEL(qry, $[0]);
		
		// we wipe first, so we reduce 'this' length for easy looping to match with els
		$.stack(this)
		 .wipe(els.length);
		
		for (var i=0; i< $.length; i++)
			$[i] = els[i];

		return $;
	},
	
	// TODO: rewrite without using YUI
	next: function(){
		var $ = yS(this), 
			nS = [];
		
		for (var i=0; i< $.length; i++) {
			var temp = DOM.getNextSibling($[i]);
			if (temp)
				nS.push(temp);
		};

		$.stack(this)
		 .wipe(nS.length);
		 
 		for (var i=0; i< $.length; i++)
			$[i] = nS[i];
		
		return $;
	},

	// TODO: rewrite without using YUI
	prev: function(){
		var $ = yS(this), 
			pS = [];
		
		for (var i=0; i< $.length; i++) {
			var temp = DOM.getPreviousSibling($[i]);
			if (temp)
				pS.push(temp);
		};

		$.stack(this)
		 .wipe(pS.length);
		 
 		for (var i=0; i< $.length; i++)
			$[i] = pS[i];
		
		return $;
	},
	
	css: function(o, o2) {
		if (isObj(o)) {
			for (p in o) {
				DOM.setStyle(this , p , o[p]);
			}
		}
		else if (isStr(o2)) {
			DOM.setStyle(this , o , o2) 
		}
		
		else if (isStr(o))
			return DOM.getStyle (this[0], o);

		return this;		
	},
	
	data: function(key,value) {
		if (value)
			for (var i=0; i< this.length; i++) {
				if(!this[i][yshortdata+yS.ySrandom]) this[i][yshortdata+yS.ySrandom] = [];
				this[i][yshortdata+yS.ySrandom][key] = value;
			}
		else if (key)
			return this[0][yshortdata+yS.ySrandom][key];
			
		return this;
	},
	
	removeData: function(key) {
		for (var i=0; i< this.length; i++) {
			if(this[i][yshortdata+yS.ySrandom]) {
				if(key) 
					delete this[i][yshortdata+yS.ySrandom][key];
				else
					delete this[i][yshortdata+yS.ySrandom];		
			}
		};

		return this;
	},
	
	bind: function(type, fn) {
		var tmp = type.split(' ');

		for (var i=0; i< tmp.length; i++)
			if(tmp[i])
				EV.addListener(this, tmp[i], fn);
		
		return this;
	},
	
	unbind: function(type, fn) {
		var tmp = type.split(' ');
		
		for (var i=0; i< tmp.length; i++)
			if(tmp[i])
				EV.removeListener(this, tmp[i], fn);

		return this;
	},
	
	dimension: function(o, type) {
		var obj = {};
			
		if (o) {
			// detect if string or int
			obj[type.toLowerCase()] = isStr(o) ? o: parseInt(o, 10) + "px"; 
			this.css(obj);
			return this;
		}
		
		type = 'client'+ type;
		return this[0][type] || false; // false for no height or width, probably item is not display:block?
	},
	
	// return width as calculated by browser
	width: function(o) {
		return this.dimension(o, 'Width');
	},
	
	// return height as calculated by browser
	height: function(o) {
		return this.dimension(o, 'Height');
	},
	
	// attr does not support style and events, meant to be like this for elegant code
	attr: function(prop, val) {
		var el;
		// if prop is obj, we disregard val
		if (isObj(prop)) {
			for(var i=0; i<this.length; i++)
				for(attribute in prop)
					this[i].setAttribute(attribute,prop[attribute]);
		}
		// if prop is not obj (means string) and val exists
		else if (val){
			for(var i=0; i<this.length; i++)
				this[i].setAttribute(prop,val);
		}
		// if prop does exists as string and val does not exist
		else if (prop){
			return this[0].getAttribute(prop);
		}

		return this;
	},
	
	appendTo: function(o) {
		var tmp = get1stNode(o),
			fragment = doc.createDocumentFragment();
			
		if (tmp) {
			for (var i=0; i< this.length; i++) {
				fragment.appendChild(this[i]);
			};
			tmp.appendChild(fragment);
		}
		return this;
	},
	
	prependTo: function(o) {
		var tmp = get1stNode(o),
			fragment = doc.createDocumentFragment();
			
		if (tmp) {
			for (var i=0; i< this.length; i++) {
				fragment.appendChild(this[i]);
			};
			var first = tmp.firstChild;
			tmp.insertBefore(fragment, first);
		}
		return this;
	},
	
	insertBefore: function(o){
		var tmp = get1stNode(o),
			fragment = doc.createDocumentFragment();

		if (tmp) {
			for (var i=0; i< this.length; i++) {
				fragment.appendChild(this[i]);
			};
			var parent = tmp.parentNode;
			parent.insertBefore(fragment, tmp);
		}
		return this;
	},
	
	insertAfter: function(o){
		var tmp = get1stNode(o),
			fragment = doc.createDocumentFragment();
		
		if (tmp) {
			for (var i=0; i< this.length; i++) {
				fragment.appendChild(this[i]);
			};
			
			var parent = tmp.parentNode,
				next = DOM.getNextSibling(tmp);
			parent.insertBefore(fragment, next);
		}
		return this;
	},
	
	/* TODO: look into function events cloning */
	clone: function(){
		var $ = yS(this),
			cloned = $[0].cloneNode(true);

		$.stack(this)
		 .wipe(1);
		 
		$[0] = cloned;
		
		return $;
	},
	
	// TODO: serialize seriously needs some heavy makeover 
	serialize: function() {
		var tmp = '';
		for (var i=0; i<this.length; i++)
			if (this[i].name)
				tmp += this[i].name + '=' + this[i].value + '&';
		// rtrim the & symbol
		return tmp.substring(0, tmp.length-1);
	},
	
	// used internally for now
	animate: function(attr, milisec, fn, easing){
		var sec = milisec/1000 || 1,
			ease = easing || YAHOO.util.Easing.easeNone,
			counter = 0,
			total = function(){// total adds up when a function has completed animating
				counter++;
				if (counter === this.length)
					fn.call(this);
			};

		for(var i=0; i<this.length; i++) {
			// make yshortEffects expando an array if not exists
			var fx = this[i][yshorteffects+yS.ySrandom] = this[i][yshorteffects+yS.ySrandom] || [];
			// push new effects into node expando
			fx.push(new YAHOO.util.Anim(this[i], attr, sec, ease));
			// animate the effects now
			fx[fx.length-1].animate();
			fx[fx.length-1].onComplete.subscribe(total);
		};
		
		return this;
	},
	
	// stops all animation
	stop: function() {
		for(var i=0; i<this.length; i++) {
			var fx =this[i][yshorteffects+yS.ySrandom];
			if(fx)
				for(var j=0; j<fx.length; j++) 
					if(fx[j])
						fx[j].stop();
		}

		return this;
	},
	
	// checks for animation, returns true or false
	animated: function() {
		var fx = this[0][yshorteffects+yS.ySrandom];
		
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
		var duration = dur/1000 || 1,
			counter = 0,
			total = function(){// total adds up when a function has completed animating
				counter++;
				if (counter === this.length)
					fn.call(this);
			};
		
		if (isObj(attr)) {
			for (var i=0; i< this.length; i++) {
				var fx = this[i][yshorteffects+yS.ySrandom] = this[i][yshorteffects+yS.ySrandom] || [];
				fx.push(new UT.ColorAnim(this[i], attr, duration));
				fx[fx.length-1].animate();
			};
		}
		
		return this;
	}
}

// drop init from list of prototypes as it's the constructor to prevent circular reference
for(prop in yS.fn) {
	if (prop != 'init')
		yS.fn.init.prototype[prop] = yS.fn[prop];
}

// define extend (o,o2,o3,o4,o5 .......)
yS.extend = function(o) {
	for ( var i = 0; i < arguments.length; i++ ) 
		for ( var key in arguments[i] ) 
			o[key] = arguments[i][key]; 
	return o;
};

// execute to extend yShort methods and properties
yS.extend(yS, {
	// add random number to prevent collision
	ySrandom: Math.floor(Math.random() * 100000),
	
	// iterate through each item in array
	each: yS.fn.each,
	
	// Make Object into Array
	makeArray: function( array ) {
		var ret = [];

		if( array != null ){
			var i = array.length;
			// The window, strings (and functions) also have 'length'
			if( i == null || typeof array === "string" || yShort.isFunction(array) || array.setInterval )
				ret[0] = array;
			else
				while( i )
					ret[--i] = array[i];
		}

		return ret;
	},
	
	// returns a unique set of array
	unique : function(a) {
		var r = [];
		o:for(var i = 0, n = a.length; i < n; i++) {
			for(var x = i + 1 ; x < n; x++) {
				if(a[x]===a[i]) continue o; // prevent window == document for DOM comparison
			}
			r[r.length] = a[i];
		}
		return r;
	},
	
	grep: function(o, fn) {
		var arry = [];
		// Go through the array, only saving the items that pass the validator function
		for ( var i = 0; i < o.length; i++ )
			if (!fn.call(o[i], o[i], i) === false)
				arry.push( o[i] );

		return arry;
	},

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
	
	// merge two arrays
	merge: function(o, o2){
		var arry = [];
		arry = o.concat(o, o2);	
		return arry;
	},

	// trim head and tail whitespace from strings
	trim: function( text ) {
		return (String(text)).replace( /^\s+|\s+$/g, "" );
	},

	// remap YUI's asyncRequest to jQuery style
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
			loading: function(o){ opts.loading.call(win, o.responseText); },
			success: function(o){ opts.success.call(win, o.responseText); },
			failure: function(o){ opts.error.call(win, o.responseText); },
			cache: opts.cache
		}
		
		CON.startEvent.subscribe(callback.loading, callback);
		var transaction = CON.asyncRequest(opts.type, opts.url, callback, opts.data); 
	},
	
	
	// A general namespace function, support root as window obj
	namespace: function(name, root) {
		if (name) {
			// explode namespace with delimiter
		    name=name.split(".");
			// root is defaulted to window obj
		    var ns = root || win;
			// loop through each level of the namespace
		    for (var i =0; i<name.length; i++) {
				// nm is current level name
		    	var nm = name[i];
				// if not exist, add current name as obj to parent level, assign ns (parent) to current
				ns = ns[nm] || ( ns[nm] = {} ); 
				
				// this will determine if we have successfully created the namespace
				if (i === name.length-1) 
					return (yS.isObject(ns)) ? true: false;
			}
		}
		return false;
	},
	
	// Public type detection, using Object.prototype.toString.call for ambigous cases
	typeOf: function(o){ return myToString.call(o).slice(8, -1).toLowerCase(); },
	isArray: function(o){ return myToString.call(o) === "[object Array]" },
	isObject: function(o){ return myToString.call(o) === "[object Object]" },
	isDate: function(o){ return myToString.call(o) === "[object Date]" },
	isFunction: isFn,
	isString: isStr,
	isNumber: function(o){ return typeof o === "number" },
	isBoolean: function(o){ return typeof o === "boolean" },

	// Detecting major browsers using feature detection
	isIE6: function(){ return (doc.body.style.maxHeight === undefined) ? true: false; },
	isIE7: function(){ return (!win.opera && win.XMLHttpRequest && !doc.querySelectorAll) ? true : false;	},
	isIE: function(){ return (win.attachEvent && !win.opera) ? true: false; },
	isGecko: function(){return (doc.getBoxObjectFor === undefined) ? false : true;	},
	isOpera: function(){ return (win.opera) ? true : false;	},
	isWebkit: function(){ return (nav.taintEnabled) ? false : true; }

}); // end yS.extend 
//end anonymous function
})();



/*!
* Sizzle CSS Selector Engine - v1.0
* Copyright 2009, The Dojo Foundation
* Released under the MIT, BSD, and GPL Licenses.
* More information: http://sizzlejs.com/
*/
(function(){
 
var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,
  done = 0,
  toString = Object.prototype.toString,
  arraySplice = Array.prototype.splice,
  arrayPush = Array.prototype.push,
  arraySort = Array.prototype.sort;
 
var Sizzle = function(selector, context, results, seed) {
  results = results || [];
  var origContext = context = context || document;
 
  if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
    return [];
  }
  
  if ( !selector || typeof selector !== "string" ) {
    return results;
  }
 
  var parts = [], m, set, checkSet, check, mode, extra, prune = true, contextXML = isXML(context);
  
  // Reset the position of the chunker regexp (start from head)
  chunker.lastIndex = 0;
  
  while ( (m = chunker.exec(selector)) !== null ) {
    parts.push( m[1] );
    
    if ( m[2] ) {
      extra = RegExp.rightContext;
      break;
    }
  }
 
  if ( parts.length > 1 && origPOS.exec( selector ) ) {
    if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
      set = posProcess( parts[0] + parts[1], context );
    } else {
      set = Expr.relative[ parts[0] ] ?
        [ context ] :
        Sizzle( parts.shift(), context );
 
      while ( parts.length ) {
        selector = parts.shift();
 
        if ( Expr.relative[ selector ] )
          selector += parts.shift();
 
        set = posProcess( selector, set );
      }
    }
  } else {
    // Take a shortcut and set the context if the root selector is an ID
    // (but not if it'll be faster if the inner selector is an ID)
    if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
        Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
      var ret = Sizzle.find( parts.shift(), context, contextXML );
      context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
    }
 
    if ( context ) {
      var ret = seed ?
        { expr: parts.pop(), set: makeArray(seed) } :
        Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
      set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;
 
      if ( parts.length > 0 ) {
        checkSet = makeArray(set);
      } else {
        prune = false;
      }
 
      while ( parts.length ) {
        var cur = parts.pop(), pop = cur;
 
        if ( !Expr.relative[ cur ] ) {
          cur = "";
        } else {
          pop = parts.pop();
        }
 
        if ( pop == null ) {
          pop = context;
        }
 
        Expr.relative[ cur ]( checkSet, pop, contextXML );
      }
    } else {
      checkSet = parts = [];
    }
  }
 
  if ( !checkSet ) {
    checkSet = set;
  }
 
  if ( !checkSet ) {
    throw "Syntax error, unrecognized expression: " + (cur || selector);
  }
 
  if ( toString.call(checkSet) === "[object Array]" ) {
    if ( !prune ) {
      arrayPush.apply( results, checkSet );
    } else if ( context && context.nodeType === 1 ) {
      for ( var i = 0; checkSet[i] != null; i++ ) {
        if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
          arrayPush.call( results, set[i] );
        }
      }
    } else {
      for ( var i = 0; checkSet[i] != null; i++ ) {
        if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
          arrayPush.call( results, set[i] );
        }
      }
    }
  } else {
    makeArray( checkSet, results );
  }
 
  if ( extra ) {
    Sizzle( extra, origContext, results, seed );
    Sizzle.uniqueSort( results );
  }
 
  return results;
};
 
Sizzle.uniqueSort = function(results){
  if ( sortOrder ) {
    hasDuplicate = false;
    arraySort.call(results, sortOrder);
 
    if ( hasDuplicate ) {
      for ( var i = 1; i < results.length; i++ ) {
        if ( results[i] === results[i-1] ) {
          arraySplice.call(results, i--, 1);
        }
      }
    }
  }
};
 
Sizzle.matches = function(expr, set){
  return Sizzle(expr, null, null, set);
};
 
Sizzle.find = function(expr, context, isXML){
  var set, match;
 
  if ( !expr ) {
    return [];
  }
 
  for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
    var type = Expr.order[i], match;
    
    if ( (match = Expr.match[ type ].exec( expr )) ) {
      var left = RegExp.leftContext;
 
      if ( left.substr( left.length - 1 ) !== "\\" ) {
        match[1] = (match[1] || "").replace(/\\/g, "");
        set = Expr.find[ type ]( match, context, isXML );
        if ( set != null ) {
          expr = expr.replace( Expr.match[ type ], "" );
          break;
        }
      }
    }
  }
 
  if ( !set ) {
    set = context.getElementsByTagName("*");
  }
 
  return {set: set, expr: expr};
};
 
Sizzle.filter = function(expr, set, inplace, not){
  var old = expr, result = [], curLoop = set, match, anyFound,
    isXMLFilter = set && set[0] && isXML(set[0]);
 
  while ( expr && set.length ) {
    for ( var type in Expr.filter ) {
      if ( (match = Expr.match[ type ].exec( expr )) != null ) {
        var filter = Expr.filter[ type ], found, item;
        anyFound = false;
 
        if ( curLoop == result ) {
          result = [];
        }
 
        if ( Expr.preFilter[ type ] ) {
          match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );
 
          if ( !match ) {
            anyFound = found = true;
          } else if ( match === true ) {
            continue;
          }
        }
 
        if ( match ) {
          for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
            if ( item ) {
              found = filter( item, match, i, curLoop );
              var pass = not ^ !!found;
 
              if ( inplace && found != null ) {
                if ( pass ) {
                  anyFound = true;
                } else {
                  curLoop[i] = false;
                }
              } else if ( pass ) {
                result.push( item );
                anyFound = true;
              }
            }
          }
        }
 
        if ( found !== undefined ) {
          if ( !inplace ) {
            curLoop = result;
          }
 
          expr = expr.replace( Expr.match[ type ], "" );
 
          if ( !anyFound ) {
            return [];
          }
 
          break;
        }
      }
    }
 
    // Improper expression
    if ( expr == old ) {
      if ( anyFound == null ) {
        throw "Syntax error, unrecognized expression: " + expr;
      } else {
        break;
      }
    }
 
    old = expr;
  }
 
  return curLoop;
};
 
var Expr = Sizzle.selectors = {
  order: [ "ID", "NAME", "TAG" ],
  match: {
    ID: /#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
    CLASS: /\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
    NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,
    ATTR: /\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
    TAG: /^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,
    CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
    POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
    PSEUDO: /:((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/
  },
  attrMap: {
    "class": "className",
    "for": "htmlFor"
  },
  attrHandle: {
    href: function(elem){
      return elem.getAttribute("href");
    }
  },
  relative: {
    "+": function(checkSet, part, isXML){
      var isPartStr = typeof part === "string",
        isTag = isPartStr && !/\W/.test(part),
        isPartStrNotTag = isPartStr && !isTag;
 
      if ( isTag && !isXML ) {
        part = part.toUpperCase();
      }
 
      for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
        if ( (elem = checkSet[i]) ) {
          while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}
 
          checkSet[i] = isPartStrNotTag || elem && elem.nodeName === part ?
            elem || false :
            elem === part;
        }
      }
 
      if ( isPartStrNotTag ) {
        Sizzle.filter( part, checkSet, true );
      }
    },
    ">": function(checkSet, part, isXML){
      var isPartStr = typeof part === "string";
 
      if ( isPartStr && !/\W/.test(part) ) {
        part = isXML ? part : part.toUpperCase();
 
        for ( var i = 0, l = checkSet.length; i < l; i++ ) {
          var elem = checkSet[i];
          if ( elem ) {
            var parent = elem.parentNode;
            checkSet[i] = parent.nodeName === part ? parent : false;
          }
        }
      } else {
        for ( var i = 0, l = checkSet.length; i < l; i++ ) {
          var elem = checkSet[i];
          if ( elem ) {
            checkSet[i] = isPartStr ?
              elem.parentNode :
              elem.parentNode === part;
          }
        }
 
        if ( isPartStr ) {
          Sizzle.filter( part, checkSet, true );
        }
      }
    },
    "": function(checkSet, part, isXML){
      var doneName = done++, checkFn = dirCheck;
 
      if ( !part.match(/\W/) ) {
        var nodeCheck = part = isXML ? part : part.toUpperCase();
        checkFn = dirNodeCheck;
      }
 
      checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
    },
    "~": function(checkSet, part, isXML){
      var doneName = done++, checkFn = dirCheck;
 
      if ( typeof part === "string" && !part.match(/\W/) ) {
        var nodeCheck = part = isXML ? part : part.toUpperCase();
        checkFn = dirNodeCheck;
      }
 
      checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
    }
  },
  find: {
    ID: function(match, context, isXML){
      if ( typeof context.getElementById !== "undefined" && !isXML ) {
        var m = context.getElementById(match[1]);
        return m ? [m] : [];
      }
    },
    NAME: function(match, context, isXML){
      if ( typeof context.getElementsByName !== "undefined" ) {
        var ret = [], results = context.getElementsByName(match[1]);
 
        for ( var i = 0, l = results.length; i < l; i++ ) {
          if ( results[i].getAttribute("name") === match[1] ) {
            ret.push( results[i] );
          }
        }
 
        return ret.length === 0 ? null : ret;
      }
    },
    TAG: function(match, context){
      return context.getElementsByTagName(match[1]);
    }
  },
  preFilter: {
    CLASS: function(match, curLoop, inplace, result, not, isXML){
      match = " " + match[1].replace(/\\/g, "") + " ";
 
      if ( isXML ) {
        return match;
      }
 
      for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
        if ( elem ) {
          if ( not ^ (elem.className && (" " + elem.className + " ").indexOf(match) >= 0) ) {
            if ( !inplace )
              result.push( elem );
          } else if ( inplace ) {
            curLoop[i] = false;
          }
        }
      }
 
      return false;
    },
    ID: function(match){
      return match[1].replace(/\\/g, "");
    },
    TAG: function(match, curLoop){
      for ( var i = 0; curLoop[i] === false; i++ ){}
      return curLoop[i] && isXML(curLoop[i]) ? match[1] : match[1].toUpperCase();
    },
    CHILD: function(match){
      if ( match[1] == "nth" ) {
        // parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
        var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
          match[2] == "even" && "2n" || match[2] == "odd" && "2n+1" ||
          !/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);
 
        // calculate the numbers (first)n+(last) including if they are negative
        match[2] = (test[1] + (test[2] || 1)) - 0;
        match[3] = test[3] - 0;
      }
 
      // TODO: Move to normal caching system
      match[0] = done++;
 
      return match;
    },
    ATTR: function(match, curLoop, inplace, result, not, isXML){
      var name = match[1].replace(/\\/g, "");
      
      if ( !isXML && Expr.attrMap[name] ) {
        match[1] = Expr.attrMap[name];
      }
 
      if ( match[2] === "~=" ) {
        match[4] = " " + match[4] + " ";
      }
 
      return match;
    },
    PSEUDO: function(match, curLoop, inplace, result, not){
      if ( match[1] === "not" ) {
        // If we're dealing with a complex expression, or a simple one
        if ( match[3].match(chunker).length > 1 || /^\w/.test(match[3]) ) {
          match[3] = Sizzle(match[3], null, null, curLoop);
        } else {
          var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
          if ( !inplace ) {
            result.push.apply( result, ret );
          }
          return false;
        }
      } else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
        return true;
      }
      
      return match;
    },
    POS: function(match){
      match.unshift( true );
      return match;
    }
  },
  filters: {
    enabled: function(elem){
      return elem.disabled === false && elem.type !== "hidden";
    },
    disabled: function(elem){
      return elem.disabled === true;
    },
    checked: function(elem){
      return elem.checked === true;
    },
    selected: function(elem){
      // Accessing this property makes selected-by-default
      // options in Safari work properly
      elem.parentNode.selectedIndex;
      return elem.selected === true;
    },
    parent: function(elem){
      return !!elem.firstChild;
    },
    empty: function(elem){
      return !elem.firstChild;
    },
    has: function(elem, i, match){
      return !!Sizzle( match[3], elem ).length;
    },
    header: function(elem){
      return /h\d/i.test( elem.nodeName );
    },
    text: function(elem){
      return "text" === elem.type;
    },
    radio: function(elem){
      return "radio" === elem.type;
    },
    checkbox: function(elem){
      return "checkbox" === elem.type;
    },
    file: function(elem){
      return "file" === elem.type;
    },
    password: function(elem){
      return "password" === elem.type;
    },
    submit: function(elem){
      return "submit" === elem.type;
    },
    image: function(elem){
      return "image" === elem.type;
    },
    reset: function(elem){
      return "reset" === elem.type;
    },
    button: function(elem){
      return "button" === elem.type || elem.nodeName.toUpperCase() === "BUTTON";
    },
    input: function(elem){
      return /input|select|textarea|button/i.test(elem.nodeName);
    }
  },
  setFilters: {
    first: function(elem, i){
      return i === 0;
    },
    last: function(elem, i, match, array){
      return i === array.length - 1;
    },
    even: function(elem, i){
      return i % 2 === 0;
    },
    odd: function(elem, i){
      return i % 2 === 1;
    },
    lt: function(elem, i, match){
      return i < match[3] - 0;
    },
    gt: function(elem, i, match){
      return i > match[3] - 0;
    },
    nth: function(elem, i, match){
      return match[3] - 0 == i;
    },
    eq: function(elem, i, match){
      return match[3] - 0 == i;
    }
  },
  filter: {
    PSEUDO: function(elem, match, i, array){
      var name = match[1], filter = Expr.filters[ name ];
 
      if ( filter ) {
        return filter( elem, i, match, array );
      } else if ( name === "contains" ) {
        return (elem.textContent || elem.innerText || "").indexOf(match[3]) >= 0;
      } else if ( name === "not" ) {
        var not = match[3];
 
        for ( var i = 0, l = not.length; i < l; i++ ) {
          if ( not[i] === elem ) {
            return false;
          }
        }
 
        return true;
      }
    },
    CHILD: function(elem, match){
      var type = match[1], node = elem;
      switch (type) {
        case 'only':
        case 'first':
          while (node = node.previousSibling) {
            if ( node.nodeType === 1 ) return false;
          }
          if ( type == 'first') return true;
          node = elem;
        case 'last':
          while (node = node.nextSibling) {
            if ( node.nodeType === 1 ) return false;
          }
          return true;
        case 'nth':
          var first = match[2], last = match[3];
 
          if ( first == 1 && last == 0 ) {
            return true;
          }
          
          var doneName = match[0],
            parent = elem.parentNode;
  
          if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
            var count = 0;
            for ( node = parent.firstChild; node; node = node.nextSibling ) {
              if ( node.nodeType === 1 ) {
                node.nodeIndex = ++count;
              }
            }
            parent.sizcache = doneName;
          }
          
          var diff = elem.nodeIndex - last;
          if ( first == 0 ) {
            return diff == 0;
          } else {
            return ( diff % first == 0 && diff / first >= 0 );
          }
      }
    },
    ID: function(elem, match){
      return elem.nodeType === 1 && elem.getAttribute("id") === match;
    },
    TAG: function(elem, match){
      return (match === "*" && elem.nodeType === 1) || elem.nodeName === match;
    },
    CLASS: function(elem, match){
      return (" " + (elem.className || elem.getAttribute("class")) + " ")
        .indexOf( match ) > -1;
    },
    ATTR: function(elem, match){
      var name = match[1],
        result = Expr.attrHandle[ name ] ?
          Expr.attrHandle[ name ]( elem ) :
          elem[ name ] != null ?
            elem[ name ] :
            elem.getAttribute( name ),
        value = result + "",
        type = match[2],
        check = match[4];
 
      return result == null ?
        type === "!=" :
        type === "=" ?
        value === check :
        type === "*=" ?
        value.indexOf(check) >= 0 :
        type === "~=" ?
        (" " + value + " ").indexOf(check) >= 0 :
        !check ?
        value && result !== false :
        type === "!=" ?
        value != check :
        type === "^=" ?
        value.indexOf(check) === 0 :
        type === "$=" ?
        value.substr(value.length - check.length) === check :
        type === "|=" ?
        value === check || value.substr(0, check.length + 1) === check + "-" :
        false;
    },
    POS: function(elem, match, i, array){
      var name = match[2], filter = Expr.setFilters[ name ];
 
      if ( filter ) {
        return filter( elem, i, match, array );
      }
    }
  }
};
 
var origPOS = Expr.match.POS;
 
for ( var type in Expr.match ) {
  Expr.match[ type ] = new RegExp( Expr.match[ type ].source + /(?![^\[]*\])(?![^\(]*\))/.source );
}
 
var makeArray = function(array, results) {
  array = Array.prototype.slice.call( array );
 
  if ( results ) {
    arrayPush.apply( results, array );
    return results;
  }
  
  return array;
};
 
// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
try {
  Array.prototype.slice.call( document.documentElement.childNodes );
 
// Provide a fallback method if it does not work
} catch(e){
  makeArray = function(array, results) {
    var ret = results || [];
 
    if ( toString.call(array) === "[object Array]" ) {
      Array.prototype.push.apply( ret, array );
    } else {
      if ( typeof array.length === "number" ) {
        for ( var i = 0, l = array.length; i < l; i++ ) {
          ret.push( array[i] );
        }
      } else {
        for ( var i = 0; array[i]; i++ ) {
          ret.push( array[i] );
        }
      }
    }
 
    return ret;
  };
}
 
var sortOrder;
 
if ( document.documentElement.compareDocumentPosition ) {
  sortOrder = function( a, b ) {
    var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
    if ( ret === 0 ) {
      hasDuplicate = true;
    }
    return ret;
  };
} else if ( "sourceIndex" in document.documentElement ) {
  sortOrder = function( a, b ) {
    var ret = a.sourceIndex - b.sourceIndex;
    if ( ret === 0 ) {
      hasDuplicate = true;
    }
    return ret;
  };
} else if ( document.createRange ) {
  sortOrder = function( a, b ) {
    var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
    aRange.selectNode(a);
    aRange.collapse(true);
    bRange.selectNode(b);
    bRange.collapse(true);
    var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
    if ( ret === 0 ) {
      hasDuplicate = true;
    }
    return ret;
  };
}
 
// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
  // We're going to inject a fake input element with a specified name
  var form = document.createElement("form"),
    id = "script" + (new Date).getTime();
  form.innerHTML = "<input name='" + id + "'/>";
 
  // Inject it into the root element, check its status, and remove it quickly
  var root = document.documentElement;
  root.insertBefore( form, root.firstChild );
 
  // The workaround has to do additional checks after a getElementById
  // Which slows things down for other browsers (hence the branching)
  if ( !!document.getElementById( id ) ) {
    Expr.find.ID = function(match, context, isXML){
      if ( typeof context.getElementById !== "undefined" && !isXML ) {
        var m = context.getElementById(match[1]);
        return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
      }
    };
 
    Expr.filter.ID = function(elem, match){
      var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
      return elem.nodeType === 1 && node && node.nodeValue === match;
    };
  }
 
  root.removeChild( form );
})();
 
(function(){
  // Check to see if the browser returns only elements
  // when doing getElementsByTagName("*")
 
  // Create a fake element
  var div = document.createElement("div");
  div.appendChild( document.createComment("") );
 
  // Make sure no comments are found
  if ( div.getElementsByTagName("*").length > 0 ) {
    Expr.find.TAG = function(match, context){
      var results = context.getElementsByTagName(match[1]);
 
      // Filter out possible comments
      if ( match[1] === "*" ) {
        var tmp = [];
 
        for ( var i = 0; results[i]; i++ ) {
          if ( results[i].nodeType === 1 ) {
            tmp.push( results[i] );
          }
        }
 
        results = tmp;
      }
 
      return results;
    };
  }
 
  // Check to see if an attribute returns normalized href attributes
  div.innerHTML = "<a href='#'></a>";
  if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
      div.firstChild.getAttribute("href") !== "#" ) {
    Expr.attrHandle.href = function(elem){
      return elem.getAttribute("href", 2);
    };
  }
})();
 
if ( document.querySelectorAll ) (function(){
  var oldSizzle = Sizzle, div = document.createElement("div");
  div.innerHTML = "<p class='TEST'></p>";
 
  // Safari can't handle uppercase or unicode characters when
  // in quirks mode.
  if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
    return;
  }
  
  Sizzle = function(query, context, extra, seed){
    context = context || document;
 
    // Only use querySelectorAll on non-XML documents
    // (ID selectors don't work in non-HTML documents)
    if ( !seed && context.nodeType === 9 && !isXML(context) ) {
      try {
        return makeArray( context.querySelectorAll(query), extra );
      } catch(e){}
    }
    
    return oldSizzle(query, context, extra, seed);
  };
 
  for ( var prop in oldSizzle ) {
    Sizzle[ prop ] = oldSizzle[ prop ];
  }
})();
 
if ( document.getElementsByClassName && document.documentElement.getElementsByClassName ) (function(){
  var div = document.createElement("div");
  div.innerHTML = "<div class='test e'></div><div class='test'></div>";
 
  // Opera can't find a second classname (in 9.6)
  if ( div.getElementsByClassName("e").length === 0 )
    return;
 
  // Safari caches class attributes, doesn't catch changes (in 3.2)
  div.lastChild.className = "e";
 
  if ( div.getElementsByClassName("e").length === 1 )
    return;
 
  Expr.order.splice(1, 0, "CLASS");
  Expr.find.CLASS = function(match, context, isXML) {
    if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
      return context.getElementsByClassName(match[1]);
    }
  };
})();
 
function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
  var sibDir = dir == "previousSibling" && !isXML;
  for ( var i = 0, l = checkSet.length; i < l; i++ ) {
    var elem = checkSet[i];
    if ( elem ) {
      if ( sibDir && elem.nodeType === 1 ){
        elem.sizcache = doneName;
        elem.sizset = i;
      }
      elem = elem[dir];
      var match = false;
 
      while ( elem ) {
        if ( elem.sizcache === doneName ) {
          match = checkSet[elem.sizset];
          break;
        }
 
        if ( elem.nodeType === 1 && !isXML ){
          elem.sizcache = doneName;
          elem.sizset = i;
        }
 
        if ( elem.nodeName === cur ) {
          match = elem;
          break;
        }
 
        elem = elem[dir];
      }
 
      checkSet[i] = match;
    }
  }
}
 
function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
  var sibDir = dir == "previousSibling" && !isXML;
  for ( var i = 0, l = checkSet.length; i < l; i++ ) {
    var elem = checkSet[i];
    if ( elem ) {
      if ( sibDir && elem.nodeType === 1 ) {
        elem.sizcache = doneName;
        elem.sizset = i;
      }
      elem = elem[dir];
      var match = false;
 
      while ( elem ) {
        if ( elem.sizcache === doneName ) {
          match = checkSet[elem.sizset];
          break;
        }
 
        if ( elem.nodeType === 1 ) {
          if ( !isXML ) {
            elem.sizcache = doneName;
            elem.sizset = i;
          }
          if ( typeof cur !== "string" ) {
            if ( elem === cur ) {
              match = true;
              break;
            }
 
          } else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
            match = elem;
            break;
          }
        }
 
        elem = elem[dir];
      }
 
      checkSet[i] = match;
    }
  }
}
 
var contains = document.compareDocumentPosition ? function(a, b){
  return a.compareDocumentPosition(b) & 16;
} : function(a, b){
  return a !== b && (a.contains ? a.contains(b) : true);
};
 
var isXML = function(elem){
  return elem.nodeType === 9 && elem.documentElement.nodeName !== "HTML" ||
    !!elem.ownerDocument && elem.ownerDocument.documentElement.nodeName !== "HTML";
};
 
var posProcess = function(selector, context){
  var tmpSet = [], later = "", match,
    root = context.nodeType ? [context] : context;
 
  // Position selectors must be done after the filter
  // And so must :not(positional) so we move all PSEUDOs to the end
  while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
    later += match[0];
    selector = selector.replace( Expr.match.PSEUDO, "" );
  }
 
  selector = Expr.relative[selector] ? selector + "*" : selector;
 
  for ( var i = 0, l = root.length; i < l; i++ ) {
    Sizzle( selector, root[i], tmpSet );
  }
 
  return Sizzle.filter( later, tmpSet );
};
 
// EXPOSE
 
window.Sizzle = Sizzle;
 
})();