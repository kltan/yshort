if (window.console && window.console.profile)
	console.profile('Function calls');

if (window.jQuery) {
	yShort = jQuery;
}

var myUnit = function() {
	try {
		var $ = yShort;
		var result = arguments[0]();
		if(result) {
			$('<pre class="passed">Passed.</pre>').appendTo(document.body);
			return;
		}
		$('<pre class="failed">' + arguments[0] + " failed.</pre>").appendTo(document.body);
	}
	catch(e) {
		throw e;
	}
}

myUnit(function(){
	return yShort('body')[0] === document.body
});

myUnit(function(){
	return yShort(document.body)[0] === document.body
});

myUnit(function(){
	return yShort()[0] === document
});

myUnit(function(){
	return yShort('')[0] === document
});

myUnit(function(){
	return yShort('div').length === 20
});

myUnit(function(){
	return yShort(function(){
		yShort('<div>Appended another div</div>').appendTo('#hiddenStuff');
		return yShort('div').length === 21
	});
});

myUnit(function(){
	var a = 1;
	yShort('a').each(function(){
		yShort(this).attr('title', 'sweet');
		if (this.title != 'sweet')
			a = 0;
	});
	return (a == 1) ? true: false;
});

myUnit(function(){
	return yShort('body').find('[title=sweet]').end()[0] === document.body
});

myUnit(function(){
	yShort('[title=sweet]').eq(2).attr('id', 'asdf');
	return yShort('[title=sweet]').eq(2)[0] === document.getElementById('asdf')
});

myUnit(function(){
	return yShort('[title=sweet]').get(2) === document.getElementById('asdf')
});

myUnit(function(){
	yShort('body').find('[title=sweet]').addClass('holly');
	var a = 0;
	yShort('[title=sweet]').each(function(){
		if(!yShort(this).hasClass('holly'))
			a = 1;
	});
	return (a == 1) ? false: true;
});

myUnit(function(){
	yShort('body').find('[title=sweet]').removeClass('holly');
	var a = 0;
	yShort('[title=sweet]').each(function(){
		if(yShort(this).hasClass('holly'))
			a = 1;
	});
	return (a == 1) ? false: true;
});

myUnit(function(){
	yShort('body').toggleClass('yahoo');
	var a = 0;
	if (!yShort('body').hasClass('yahoo'))
		a = 1;
	yShort('body').toggleClass('yahoo');
	if (yShort('body').hasClass('yahoo'))
		a = 1;
	return (a == 1) ? false: true;
});
/*
myUnit(function(){
	yShort('body').toggleClass('yahoo');
	yShort('body').replaceClass('yahoo', 'yahoo2');
	
	return document.body.className=='yahoo2';
});

myUnit(function(){
	var len1 = yShort('ul').generateId('yoshi').length;
	var len2 = yShort('[id^=yoshi]').length;
	
	return len1 === len2;
});

myUnit(function(){
	return yShort.isNumber(yShort('body').getRegion().top) && yShort.isNumber(yShort('body').getRegion().right);
});
*/
myUnit(function(){
	return yShort('[title=sweet]').eq(0).html('asdf');
});

myUnit(function(){
	return yShort('[title=sweet]').eq(0).html() === 'asdf'
});

myUnit(function(){
	yShort('<input type="text" id="lastIn" />').appendTo('#hiddenStuff');
	return yShort('#hiddenStuff').find('#lastIn').val(0).val() == '0';
});

myUnit(function(){
	return yShort('#hiddenStuff').find('#lastIn').val('asdfa').val() == 'asdfa';
});

myUnit(function(){
	return yShort('#hiddenStuff').filter(':not(#hiddenStuff)').length == 0;
});

myUnit(function(){
	return yShort('#hiddenStuff').is('#hiddenStuff');
});

myUnit(function(){
	return yShort('#hiddenStuff').not('#hiddenStuff').length == 0;
});

myUnit(function(){
	return yShort('body').add('div').length > 1;
});

myUnit(function(){
	return yShort('body').add('div').end()[0] === document.body;
});

myUnit(function(){
	return yShort('body').children().length === 42;
});

myUnit(function(){
	return yShort('body').children().end()[0]=== document.body;
});

myUnit(function(){
	return yShort('body').children().end()[0]=== document.body;
});

myUnit(function(){
	return yShort('ul').parent().length === 14;
});

myUnit(function(){
	return yShort('ul').parent().end().length === 16;
});
/*
myUnit(function(){
	return yShort('ul').ancestors('html')[0] === document.documentElement;
});

myUnit(function(){
	return yShort('ul').ancestors().end().length === 16
});
*/
myUnit(function(){
	return yShort('body').find('a').end()[0] === document.body
});

myUnit(function(){
	return yShort("br").eq(0).next()[0].tagName === 'BR';
});

myUnit(function(){
	return yShort("br").eq(1).prev()[0] === yShort("br")[0];
});

myUnit(function(){
	return yShort('#hiddenStuff').empty();
});

myUnit(function(){
	return yShort('#hiddenStuff')[0].childNodes.length === 0;
});

yShort('body').css('backgroundColor','black');
yShort('body').css('color','white');

if (window.console && window.console.profile)
	console.profileEnd('Function calls');