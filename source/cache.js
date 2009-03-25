// caching of even natives to improve reference speed in non-JIT bytecode javascript engines
var doc = document,
	win = this,
	nav = navigator,
	undefined, // speeding up undefined
	myToString = Object.prototype.toString, // type detection function call
	UT = win.YAHOO.util, // YAHOO.util
	DOM = UT.Dom, // YAHOO.util.Dom
	EV = UT.Event, // YAHOO.util.Event
	CON = UT.Connect, // YAHOO.util.Connect
	SEL = function(qry, context){ return win.Sizzle ? win.Sizzle(qry, context) : UT.Selector.query(qry, context)}, // Sizzle or YAHOO.util.Selector.query
	EL = UT.Element, // YAHOO.util.Element
	FIL = function(o, qry){	return win.Sizzle ?	win.Sizzle.filter(qry, o): UT.Selector.filter(o, qry); },
	
	// check for object, not using Miller as we want Array to be detected as object in many instance
	isObj = function(o) { return typeof o === "object" }, // array is also detected as object
	
	// some internal properties
	get1stNode = function(o) { 	return o.nodeType ? o : SEL(o)[0]; }, // yShort internal method
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

