<? 

/**************************************
* This is a simple builder for yShort *
**************************************/

header('Content-Type: text/html; charset=utf-8'); 
?>


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>yShort builder</title>
<style>
body, textarea { font: 12px "Courier New", Courier, monospace; }
textarea { width: 100%; height: 300px; }
</style>
</head>
<body>


<?
echo 'Config file loading ..........<br />';
require_once('config.php'); // config variables
echo 'Config file loaded.<br /><br />';

echo 'yShort source loading ..........<br />';
ob_start(); // start output buffering
require_once('source/header.js'); 
require_once('source/cache.js'); 
require_once('source/manipulate.js'); 
require_once('source/extension.js'); 
require_once('source/footer.js'); 
$content = ob_get_contents(); // get the output buffer
ob_end_clean(); // don't output the buffer to screen
echo 'yShort source loaded.<br /><br />';

// create a development version of the file
echo 'Creating yShort development version ..........<br />';
$fp = fopen('yshort.js',"w+");
fwrite($fp, $content);
fclose($fp);
echo 'yshort.js created.<br /><br />';

// create a minified version of the file
echo 'Creating yShort production version ..........<br />';
$exec_string = 'java -jar yc.jar yshort.js -o yshort.min.js 2>&1';
exec($exec_string, $output, $return);


// if no error
if (!$return) { 
	echo 'yshort.min.js created.<br /><br />';
	$content = file_get_contents('yshort.min.js');
	echo 'Minified source is<br /><br /><textarea>'. $content. '</textarea>';
	echo '<br /><br /><a href="yshort.js">Download production version</a>&nbsp;&nbsp;&nbsp;&nbsp;';
	echo '<a href="yshort.min.js">Download minified version</a>';
}	
else
	echo '<textarea>'.implode("\n", $output).'</textarea>';
?>

</body>
</html>