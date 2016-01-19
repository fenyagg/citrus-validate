$(function() {
	window.form1 = new citrusValidate($(".form-validate"));

});

function citrusValidate(form){
	$this = this;
	$form = form;
	
	var rules = {
  		"required": function(field){
  			return !!field.val();
  		}
  	};

  	var errorMessages = {
  		required: "Это поле необходимо заполнить.",
		remote: "Пожалуйста, введите правильное значение.",
		email: "Пожалуйста, введите корректный адрес электронной почты.",
		url: "Пожалуйста, введите корректный URL.",
		date: "Пожалуйста, введите корректную дату.",
		dateISO: "Пожалуйста, введите корректную дату в формате ISO.",
		number: "Пожалуйста, введите число.",
		digits: "Пожалуйста, вводите только цифры.",
		creditcard: "Пожалуйста, введите правильный номер кредитной карты.",
		equalTo: "Пароли не совпадают.",
		extension: "Пожалуйста, выберите файл с правильным расширением.",
		maxlength: "Пожалуйста, введите не больше символов.",
		minlength: "Пожалуйста, введите не меньше символов.",
		rangelength: "Пожалуйста, введите значение длиной от {0} до {1} символов.",
		range: "Пожалуйста, введите число от {0} до {1}.",
		max: "Пожалуйста, введите число, меньшее или равное {0}.",
		min: "Пожалуйста, введите число, большее или равное {0}.",
		phone: "Пожалуйста, введите корректный номер телефона.",
		mobile: "Пожалуйста, введите корректный номер мобильного телефона.",
		inn: "Введите корректный ИНН.",
		inn_u: "Введите корректный ИНН юр лица.",
		inn_f: "Введите корректный ИНН физ лица.",
		ogrn: "Введите корректный ОГРН.",
		kpp: "Введите корректный КПП."
  	}
  	$this.fieldValidate = function(field){
  		//делаем массив из названий правил валидации
		var validArray = field.data("valid").split(" ");

		//перебираем все правила валидации
		validArray.forEach(function(rule_name, i, arr) {
			//если нет такого правила пишем ошибку
			if(!rules.hasOwnProperty(rule_name)) {
				console.log("citrusValidate: Нет правила для "+rule_name);
				return false;
			}
			//если есть запускаем валидацию			
			if(!rules[rule_name](field)){
				field.addClass('invalid');
				$form.addClass('invalid');
				return false;
			}
		});
  	};
  	$this.formValidate = function(){
  		//сбор полей для валидации
	    var validFields = $form.find("[data-valid]");     
	    if( validFields.length == 0 ) return;

	    //перебираем поля для валидации
		validFields.each(function(index, el) {
			$this.fieldValidate($(this));			
		});
  	}

  	$this.formValidate();
}
