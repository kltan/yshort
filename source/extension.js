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
	
	viewport: function() {
		return DOM.getClientRegion();
	},

	// Make Object into Array
	makeArray: function( array ) {
		var ret = [];
		ret.prototype = array.prototype;

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
