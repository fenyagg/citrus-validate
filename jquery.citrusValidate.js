$(function() {
	window.form1 = new citrusValidate($(".form-validate"), {
		onFieldError: function(field, error){

		},
		onFieldSuccess: function(field){

		}
	});
	
});

function citrusValidate(form, params){
	validator = this;
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

  	validator.fieldValidate = function(field){
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
				field.parent().addClass('has-error');
				field.parent().removeClass('has-success');
				field.after('<div class="error help-block">'+errorMessages[rule_name]+'</div>');
				return false;
			}else {
				field.removeClass('invalid');
				field.parent().removeClass('has-error');
				field.parent().addClass('has-success');
				field.next(".error").remove();
				return true;
			}
		});
  	};
  	validator.formValidate = function(){  		
  		//сбор полей для валидации
	    var validFields = $form.find("[data-valid]");
	    if( validFields.length == 0 ) return;

	    var form_valid = true; // по началу форма валидна
	    //перебираем поля для валидации
		validFields.each(function(index, el) {
			if( !validator.fieldValidate($(this)) ) form_valid = false;
		});
		//если хоть одно поле не прошло валидацию добавляем класс к форме
		if(!form_valid) {
			$form.addClass('invalid');
			return false;
		}
		return true;
  	}
// 	validator.formValidate();

  	//добавим проверку на change для каждого поля	
  	;(function init(){
  		$(document)
	  		.on('change', '[data-valid]', function(event) {	  			
				validator.fieldValidate($(this));
			});
  	}());	
}




