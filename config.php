<?

// Settings for yShort

$version = '0.4';
$homepage = 'http://github.com/kltan/yshort/tree/master';
$description = 'A really short way to write YUI 2.6.x - 2.7.x';
$license = 'Dual licensed under the MIT and BSD';
$copyright = 'Copyright 2008-2009 Kean Tan';
$time = date('Y-m-d h:i:s A', time());

$source = array(
	'source/header.js',
	'source/cache.js',	
	'source/manipulate.js',
	'source/extension.js',
	'source/footer.js',
//	'source/sizzle.js'
);

$output_file = 'yshort.js';
$output_min = 'yshort.min.js';

$include_yShort = true;
$include_jQuery = false;

?>