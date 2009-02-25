// drop init from list of prototypes as it's the constructor to prevent circular reference
for(prop in yS.fn) {
	if (prop != 'init')
		yS.fn.init.prototype[prop] = yS.fn[prop];
}

// define, for global ease of use
yS.extend = yS.fn.extend;

// execute to extend yShort
yS.extend(yS, {
	// add random number to prevent collision
	ySrandom: Math.floor(Math.random() * 100000),
	
	// iterate through each item in array
	each: yS.fn.each,
	
	// Make Object into Array
	makeArray: function(o){	return Array.prototype.slice.call(o); },
	
	// returns a unique set of array
	unique : function(a) {
		var r = [];
		o:for(var i = 0, n = a.length; i < n; i++) {
			for(var x = i + 1 ; x < n; x++) {
				if(a[x]===a[i]) continue o;
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
			loading: function(o){ opts.loading.call(doc, o.responseText); },
			success: function(o){ opts.success.call(doc, o.responseText); },
			failure: function(o){ opts.error.call(doc, o.responseText); },
			cache: opts.cache
		}
		
		CON.startEvent.subscribe(callback.loading, callback);
		var transaction = CON.asyncRequest(opts.type, opts.url, callback, opts.data); 
	},
	
	
	// A general namespace function, support root as window obj
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
				
				// this will determine if we have successfully created the namespace
				if (i === name.length-1) 
					return (yS.isObject(ns)) ? true: false;
			}
		}
		return false;
	},
	
	//Public type detection using Mark Miller's method
	typeOf: function(o){ return myToString(o).slice(8, -1).toLowerCase(); },
	isArray: function(o){ return myToString(o) === "[object Array]" },
	isFunction: function(o){ return myToString(o) === "[object Function]" },
	isObject: function(o){ return myToString(o) === "[object Object]" },
	isDate: function(o){ return myToString(o) === "[object Date]" },
	isString: function(o){ return myToString(o) === "[object String]" },
	isNumber: function(o){ return myToString(o) === "[object Number]" },
	isBoolean: function(o){ return myToString(o) === "[object Boolean]" },

	// Detecting major browsers using feature detection
	isIE6: function(){ return (doc.body.style.maxHeight === undefined) ? true: false; },
	isIE7: function(){ return (!win.opera && win.XMLHttpRequest && !doc.querySelectorAll) ? true : false;	},
	isIE: function(){ return (win.attachEvent && !win.opera) ? true: false; },
	isGecko: function(){return (doc.getBoxObjectFor === undefined) ? false : true;	},
	isOpera: function(){ return (win.opera) ? true : false;	},
	isWebkit: function(){ return (nav.taintEnabled) ? false : true; }

}); // end yS.extend 
