// yS for internal use 
// YAHOO.util.Short for global use
var yS = UT.Short = win.yShort = win.y$ = function( qry, context ) {
	// Constructor
	return new yS.fn.init( qry, context );
};

yS.fn = yS.prototype = {
	// constructor, determines what to do with the query passed in
	// the lesser the function calls from here the better
	init: function(qry, context) {
		this.context = context || doc;
		qry = qry || doc;
	
		this.previousStack = [];
		var myresult = [];
		
		// if DOM node
		if (qry.nodeType)
			myresult = [qry];
		
		// if String
		else if (typeof qry === "string") {
			// if HTML, create nodes from it and push into yShort object, then we can manipulate the nodes with yShort methods
			if (/^<(.|\s)+>$/.test(qry)) {
				var x = doc.createElement('DIV');
				x.innerHTML = qry;
				for (var i =0; i < x.childNodes.length; i++)
					myresult[i] = x.childNodes[i];
			}
			else {
				// if CSS query
				this.selector = qry;
				var result = SEL(qry, this.context);
				myresult = result;
			}
		}
		
		// if array, object or yShort object
		else if (typeof qry === "object") {						
			myresult = qry;
			if (!yS.isArray(myresult))
				myresult = Array.prototype.slice.call(myresult);

			this.selector = qry.selector || null;
		}
		
		// onDOMready, we call the qry function and pass window object as the calling object, 
		// YAHOO.util.Short as it's first argument and YAHOO.util.Shortcuts as second
		else if (typeof qry === "function") {
			EV.onDOMReady(function(){ 
				qry.call(win, yS, shortcuts);
			});
		}
		
		this.length = 0;
		this.push.apply(this, myresult);
	},
	
	/****************************************************************
	 * all the members below are shared amongs all yShort objects,  *
	 * you change one, they affect ALL YAHOO.util.Short objects     *
	 ****************************************************************/
	 
	// overload three of these and it will trick firebug to display yShort as array (false array)
	push: Array.prototype.push,
	sort: Array.prototype.sort,
	splice: Array.prototype.splice,
	
	// version number and also for yShort object detection
	yShort: '<?=$version?>',
	// numbers of nodes inside current yShort obj
	length: null,
	// the initial selector that was used to create this yshort obj, useful for live and die
	selector: null,
	
	// not used in init to minimize function calls, use everywhere except init
	populate: function(els){
		this.length = 0;
		this.push.apply(this, els);
		return this;
	},
	
	// iterate through all of yShorts elements or o's elements
	each: function(o, fn) {
		// for performance, no vigorous check, let there be errors if user pass something out of the ordinary
		if (!fn)
			for (var i=0; i < this.length; i++)
				o.call(this[i], i);
		//
		else {
			if (!o.yShort && !yS.isArray(o))
				o = yS.makeArray(o); // if not array or yShort object, we need it to be an array
			for (var i=0; i < o.length; i++)
				fn.call(o[i], i);
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
	
	// manipulate innerHTML of nodes or return innerHTML of first node
	html: function(str) {
		if (yS.isNumber(str) || yS.isString(str))
			for (var i=0; i< this.length; i++) {		
				this[i].innerHTML = str;
			}
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
		 .wipe(els.length)
		 .populate(els);
	
		return $;
	},
	
	is: function(qry, obj) {
		var o = [];
		if (obj) {o[0] = obj }
		else { o = this; }

		var els = FIL(o, qry);

		return els.length ? true: false;
	},
	
	// just pass this to the selector filter and wrap them in :not
	not: function(qry) {
		var $ = yS(this);
		var els = FIL($, ":not("+qry+")");
		
		$.stack(this)
		 .wipe(els.length)
		 .populate(els);
		return $;
	},
	
	add: function(qry) {
		var els = [], 
			$ = yS(this);

		if (qry.nodeType)  // you can add a node
			els[0] = qry;
		else if (isObj(qry)) { 
			// a yshort object, array or object
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
		 
		/*
		for (var i=0; i< $.length; i++)
			$[i] = els[i];
		*/
		$.populate(els);
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
		 
		/*for (var i=0; i< $.length; i++)
			$[i] = els[i];*/
		$.populate(els);

		return $;
	},

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
			
			if(str)	{
				els = FIL(els, str);
				els = yS.unique(els);
			}
			// we wipe first, so we reduce 'this' length for easy looping to match with els
			$.stack(this)
			 .wipe(els.length);
	
			$.populate(els);

		}
		else {
			$.stack(this)
			 .wipe(els.length);
		}

		return $;
	},
	
	find: function(qry) {
		var els = [],
			$ = yS(this);

		els = SEL(qry, $[0]);
		
		// we wipe first, so we reduce 'this' length for easy looping to match with els
		$.stack(this)
		 .wipe(els.length)
		 .populate(els);

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
		 .wipe(nS.length)
		 .populate(nS);

		
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
		 .wipe(pS.length)
		 .populate(pS);

		return $;
	},
	
	css: function(o, o2) {
		if (isObj(o)) {
			for (var p in o) {
				DOM.setStyle(this , p , o[p]);
			}
		}
		else if (yS.isString(o2)) {
			DOM.setStyle(this , o , o2) 
		}
		
		else if (yS.isString(o))
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
	
	/* this has to be rewritten to have event namespacing */
	bind: function(type, fn) {
		var tmp = type.split(' ');

		for (var i=0; i< tmp.length; i++)
			if(tmp[i])
				EV.addListener(this, tmp[i], fn);
		
		return this;
	},
	
	/* this has to be rewritten to have event namespacing */
	unbind: function(type, fn) {
		for(var i=0; i<this.length; i++)
			EV.removeListener(this[i], fn);

		return this;
	},
	
	dimension: function(o, type) {
		var obj = {};
			
		if (o) {
			// detect if string or int
			obj[type.toLowerCase()] = yS.isString(o) ? o: parseInt(o, 10) + "px"; 
			this.css(obj);
			return this;
		}
		// if windows
		if (this[0] === win)
			return yS.viewport()[type.toLowerCase()] || null;

		// if document or documentElement
		else if (this[0] === doc || this[0] === doc.documentElement)
			return DOM['getDocument' + type]() || null;
		
		else {
			var region = DOM.getRegion(this[0]);
			if (type === 'Width')
				return (region.right - region.left) || null;
			
			else if (type === 'Height')
				return (region.bottom - region.top) || null;
		}
		return null; // null for error
	},
	
	// return width as calculated by browser
	width: function(o) {
		return this.dimension(o, 'Width');
	},
	
	// return height as calculated by browser
	height: function(o) {
		return this.dimension(o, 'Height');
	},
		
	offset: function(){
		return DOM.getRegion(this[0]);
	},
	
	// attr does not support style and events, meant to be like this for elegant code
	attr: function(prop, val) {
		var el;
		// if prop is obj, we disregard val
		if (isObj(prop)) {
			for(var i=0; i<this.length; i++)
				for(var attribute in prop)
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
	
	empty: function(){
		this.html('');
		return this;
	},
	
	clone: function(){
		var $ = yS(this),
			cloned = [];

		for(var i=0;i<$.length;i++) {
			var string;
			if ($[i].outerHTML){
				string = $[i].outerHTML;		
			}
			else {
				var x = doc.createElement('DIV');
				x.appendChild($[i].cloneNode(true));
				string = x.innerHTML;
			}
			// newlines and spaces will cause some browsers to breakdown
			cloned.push(yS(string.replace(/[\n\r\t]/g, '').replace( /^\s+|\s+$/g, ''))[0]);
		}

		$.wipe()
		 .stack(this)
		 .populate(cloned);
				
		return $;
	},
	
	serialize: function() {
		var tmp = '';
		for (var i=0; i<this.length; i++)
			if (this[i].name) // not necessary to have a value
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

