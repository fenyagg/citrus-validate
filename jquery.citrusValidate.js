/*
 * CitrusValidator jQuery Plugin v0.4
 */
var citrusValidator = new function() {
	validator = this;

	var rules = {
  		"required": function(field){
  			return field.is("[type='checkbox']") ? field.is(":checked") : !!field.val();
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

  	validator.addFieldError = function(field, messagesList){
  		if(!field.hasClass('error-field')) {
			field.addClass('error-field');
			field.parents(".input-container").addClass('has-error')
											 .removeClass('has-success')
											 .append('<div class="error help-block">'+messagesList+'</div>');
		}				
  	}
  	validator.removeFieldError = function(field){
  		field.removeClass('error-field');
		field.parents(".input-container").removeClass('has-error')
					  					 .addClass('has-success')
					  					 .find(".error").remove();
  	}
  	validator.validateField = function(field, action){  		
  		var action = (typeof action === 'undefined') ? true : action;//если true то добавляются обработчики ошибок  		
  		console.log(action);
  		//делаем массив из названий правил валидации
		var validArray = field.data("valid").split(" ");			

		//перебираем все правила валидации
		validArray.forEach(function(rule_name, i, arr) {
			//если нет такого правила пишем ошибку
			if(!rules.hasOwnProperty(rule_name)) {
				console.log("citrusValidate: Нет правила для "+rule_name);
				return true;
			}
			//запускаем валидацию			
			if(!rules[rule_name](field)) {
				if(action) validator.addFieldError(field, errorMessages[rule_name]);
				return false;
			} else {
				if(action) validator.removeFieldError(field);
				return true;
			}
		});
  	  	 		
  	};  	
  	validator.validateForm = function($form){  		
  		//сбор полей для валидации
	    var validFields = $form.find("[data-valid]");
	    if( validFields.length == 0 ) return;

	    var form_valid = true; // по началу форма валидна
	    //перебираем поля для валидации
		validFields.each(function(index, el) {
			if( !validator.validateField($(this)) ) form_valid = false;
		});
		//если хоть одно поле не прошло валидацию добавляем класс к форме
		if(!form_valid) {
			$form.addClass('invalid');
			return false;
		}
		return true;
  	}
// 	validator.formValidate();
}

//для удобного запуска валидатора
;(function( $ ){
  $.fn.citrusValidate = function() {  		
  		$(this).each(function(index, el) { //в каждой форме
	  		$(this).on('change', '[data-valid]', function(event) { // каждое поле при изменении
				citrusValidator.validateField($(this));	// отправляется в валидатор
			});
			$(this).on('submit', function(event) {
				event.preventDefault();
				citrusValidator.validateForm($(this));
			});
			//проверяем поля important
			$(this).find("[data-valid*='important']").each(function(index, el) {

				console.log(citrusValidator.validateField($(this), false));
			});
			
			
  		});
  };
})( jQuery );



$(function() {
	//возможно добавлю эти параметры колбэками
	/*window.form1 = new citrusValidate($(".form-validate"), {
		onFieldError: function(field, error){

		},
		onFieldSuccess: function(field){

		}
	});*/

	//запускаем плагин
	$(".form-validate").citrusValidate();
});