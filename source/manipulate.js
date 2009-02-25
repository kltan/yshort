// yS for internal use 
// YAHOO.util.Short for global use
var yS = UT.Short = function( qry, context ) {
	// Constructor
	return new yS.fn.init( qry, context );
};

yS.fn = yS.prototype = {
	// constructor, determines what to do with the query passed in
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
		
		// if array, object or yShort object
		else if (isObj(qry)) {
			if (!o.yShort && yS.isObject(o))
				o = yS.makeArray(o); // if not array or yShort object, we need it to be an array

			for(var i =0; i<qry.length; i++)
				$[i] = qry[i];
			$.length = qry.length;
			$.selector = qry.selector || null;
		}
		
		// if function is passed, this runs before isHTML as it will also evaluate true
		// onDOMready, we call the qry function and pass window object as the calling object, 
		// YAHOO.util.Short as it's first argument and YAHOO.util.Shortcuts as second
		else if (isFn(qry)) {
			EV.onDOMReady(function(){ 
				qry.call(win, yS, shortcuts);
			});
		}		
		// if HTML, create nodes from it and push into yShort object, then we can manipulate the nodes with yShort methods
		else if (isHTML(qry)) {
			var c = 0,
			x = doc.createElement('YSHORT');
			x.innerHTML= qry;

			for (var i=0; i< x.childNodes.length; i++) {
				if(x.childNodes[i].nodeType === 1) {
					$[c] = x.childNodes[i];
					c++;
				}
			}
			$.length=c;
		}
		
		// if blank spaces have been passed
		else if (!yS.trim(qry).length) {
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
		// things added/created in init constructor is a new instance
		$.previousStack = [];

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
		var $ = this;
		
		// no vigorous check, let there be errors if user pass something out of the ordinary
		if (!fn)
			for (var i=0; i < $.length; i++)
				o.call($[i], i, $[i]);
		//
		else {
			if (!o.yShort && yS.isObject(o))
				o = yS.makeArray(o); // if not array or yShort object, we need it to be an array
			for (var i=0; i < o.length; i++)
				fn.call(o[i], i, $[i]);
		}
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
		return $;
	},
	
	// push in stack and wipe everything in this
	stack: function(prev){
		var $ = this;
		$.previousStack.push(prev);
		
		return $;
	},
	
	//end pops previous stacks and put in this	
	end: function(){
		var $ = this,
			ret = $.previousStack[0];

		return ret;
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
	
	// manipulate innerHTML of nodes or return innerHTML of first node
	html: function(str) {
		var $ = this;

		if (str === 0 || str) 
			$.each(function(i){	
				$[i].innerHTML = str; 
			});
		else 
			return $[0].innerHTML;
			
		return $;
	},
	
	// manipulate value of nodes or return value of first node
	val: function(str) {
		var $ = this;
		// stringent check on integer or empty string to prevent 0 as being detected as false
		if (yS.trim(str) === '' || String(str).length)
			$.each(function(i){
				$[i].value = str;
			});
		else
			return $[0].value;
			
		return $;
	},
	
	// filter current nodes based on the CSS rules
	filter: function(qry) {
		var $ = yS(this),
			els = FIL($, qry);
		// wipe plus reset length
		$.stack(this)
		 .wipe(els.length)
		 .each(function(i){ $[i] = els[i] });
	
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

		$.each(function(i){ 
			// cause we are concatenating array with array			
			els = els.concat(DOM.getChildren($[i]));
		});

		if (qry)
			els = FIL(els, qry);
		
		// we wipe first, so we increase 'this' length for easy looping to match with els
		$.stack(this)		
		 .wipe(els.length)
		 .each(function(i){
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
		
		els = yS.unique(els);
		
		// we wipe first, so we reduce 'this' length for easy looping to match with els
		$.stack(this)
		 .wipe(els.length)
		 .each(function(i){
			$[i] = els[i];
		 });

		return $;
	},
	// TODO: rewrite ancestors so that i doesn't have to be filtered by str 
	ancestors: function(str){
		var els=[],
			$ = yS(this);
		
		if (str) {	
			$.each(function(i){
				var temp = $[i];
				while(temp){
					els.push(temp);
					temp=temp.parentNode;
				}
			});
	
			els = FIL(els, str);
			els = yS.unique(els);

			// we wipe first, so we reduce 'this' length for easy looping to match with els
			$.stack(this)
			 .wipe(els.length)
			 .each(function(i){
				$[i] = els[i];
			 });
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

		$.each(function(i){
			els = els.concat(SEL(qry, $[i]));
		});
		els = yS.unique(els);
		
		// we wipe first, so we reduce 'this' length for easy looping to match with els
		$.stack(this)
		 .wipe(els.length)
		 .each(function(i){
			$[i] = els[i];
		 });

		return $;
	},
	
	// TODO: rewrite without using YUI
	next: function(){
		var $ = yS(this), 
			nS = [];
		
		$.each(function(i){
			var temp = DOM.getNextSibling($[i]);
			if (temp)
				nS.push(temp);
		});

		$.stack(this)
		 .wipe(nS.length)
		 .each(function(i){
			$[i] = nS[i];
		 });
		
		return $;
	},
	// TODO: rewrite without using YUI
	prev: function(){
		var $ = yS(this), 
			pS = [];
		
		$.each(function(i){
			var temp = DOM.getPreviousSibling($[i]);
			if (temp)
				pS.push(temp);
		});

		$.stack(this)
		 .wipe(pS.length)
		 .each(function(i){
			$[i] = pS[i];
		 });
		
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
				if(!$[i][yshortdata+yS.ySrandom]) $[i][yshortdata+yS.ySrandom] = [];
				$[i][yshortdata+yS.ySrandom][key] = value;
			});
		else if (key)
			return $[0][yshortdata+yS.ySrandom][key];
			
		return $;
	},
	
	removeData: function(key) {
		var $ = this;
		$.each(function(i){
			if($[i][yshortdata+yS.ySrandom]) {
				if(key) 
					delete $[i][yshortdata+yS.ySrandom][key];
				else
					delete $[i][yshortdata+yS.ySrandom];		
			}
		});

		return $;
	},
	
	bind: function(type, fn) {
		var tmp = type.split(' '),
			$ = this;
		for (var i=0; i< tmp.length; i++)
			if(tmp[i])
				EV.addListener($, tmp[i], fn);
		
		return $;
	},
	
	unbind: function(type, fn) {
		var tmp = type.split(' '),
			$ = this;
		for (var i=0; i< tmp.length; i++)
			if(tmp[i])
				EV.removeListener($, tmp[i], fn);

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
			
		if (o) {
			// detect if string or int
			obj[type.toLowerCase()] = isStr(o) ? o: parseInt(o, 10) + "px"; 
			$.css(obj);
			return $;
		}
		
		type = 'client'+ type;
		return $[0][type] || false; // false for no height or width, probably item is not display:block?
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
		var $ = this,
			el;
		// if prop is obj, we disregard val
		if (isObj(prop)) {
			for(var i=0; i<$.length; i++)
				for(attribute in prop)
					$[i].setAttribute(attribute,prop[attribute]);
		}
		// if prop is not obj (means string) and val exists
		else if (val){
			for(var i=0; i<$.length; i++)
				$[i].setAttribute(prop,val);
		}
		// if prop does exists as string and val does not exist
		else if (prop){
			return $[0].getAttribute(prop);
		}

		return $;
	},
	
	appendTo: function(o) {
		var tmp = get1stNode(o),
			$ = this,
			fragment = doc.createDocumentFragment();
			
		if (tmp) {
			$.each(function(i){
				fragment.appendChild($[i]);
			});
			tmp.appendChild(fragment);
		}
		return $;
	},
	
	prependTo: function(o) {
		var tmp = get1stNode(o),
			$ = this,
			fragment = doc.createDocumentFragment();
			
		if (tmp) {
			$.each(function(i){
				fragment.appendChild($[i]);
			});
			var first = tmp.firstChild;
			tmp.insertBefore(fragment, first);
		}
		return $;
	},
	
	insertBefore: function(o){
		var tmp = get1stNode(o),
			$ = this,
			fragment = doc.createDocumentFragment();

		if (tmp) {
			$.each(function(i){
				fragment.appendChild($[i]);
			});
			var parent = tmp.parentNode;
			parent.insertBefore(fragment, tmp);
		}
		return $;
	},
	
	insertAfter: function(o){
		var tmp = get1stNode(o),
			$ = this,
			fragment = doc.createDocumentFragment();
		
		if (tmp) {
			$.each(function(i){
				fragment.appendChild($[i]);
			});
			
			var parent = tmp.parentNode,
				next = DOM.getNextSibling(tmp);
			parent.insertBefore(fragment, next);
		}
		return $;
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
			var fx = $[i][yshorteffects+yS.ySrandom] = $[i][yshorteffects+yS.ySrandom] || [];
			// push new effects into node expando
			fx.push(new YAHOO.util.Anim($[i], attr, sec, ease));
			// animate the effects now
			fx[fx.length-1].animate();
			fx[fx.length-1].onComplete.subscribe(total);
		};
		
		return $;
	},
	
	// stops all animation
	stop: function() {
		var $ = this;
		for(var i=0; i<$.length; i++) {
			var fx =$[i][yshorteffects+yS.ySrandom];
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
			fx = $[0][yshorteffects+yS.ySrandom];
		
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
				var fx = $[i][yshorteffects+yS.ySrandom] = $[i][yshorteffects+yS.ySrandom] || [];
				fx.push(new UT.ColorAnim($[i], attr, duration));
				fx[fx.length-1].animate();
			});
		}
		
		return $;
	}
}

