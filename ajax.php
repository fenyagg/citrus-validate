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

	$errorMessage = $ifAlreadyIn ? 'Такое имя уже существует' : true;
} else {
	$errorMessage = false;
}
$test = 1;
for ($i=0; $i < 100000000; $i++) { 
	$test = $test*$i;
}
echo json_encode($errorMessage);
?>