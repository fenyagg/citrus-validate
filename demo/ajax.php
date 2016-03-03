<?//sleep(2); echo (rand(0,1) ? 'Такое имя уже существует' : "")?>
<?
if(isset($_POST['value'])){
	$names = array(
		'дима',
		'оля',		
		'бронислав',
		'маша',
		'ваня',
		'иван',
		'антон',
		'юра',
		'алексей',
	);
	
	$postName = trim(mb_convert_case($_POST['value'], MB_CASE_LOWER, "UTF-8"));
	$ifAlreadyIn = array_search($postName, $names) !== false;

	$error = "";
	if($ifAlreadyIn) $error = 'Такое имя уже существует';
} 
//имитируем бурную деятельность
sleep(2);
echo $error;
?>