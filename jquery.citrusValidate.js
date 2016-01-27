/*
 * CitrusValidator jQuery Plugin v0.5
 */
;(function( $ ){
/*
	Вспомогательные функции и объекты
*/	
	//отчищает строку от (), пробелов, -
	function clearString(string){
		return string.replace(/\(|\)|\s+|-/g, "");
	}
	var rules = {
			"required" : function(field) {
				return field.is("[type='checkbox']") ? field.is(":checked") : !!field.val();
			},
			//поля important блокируют submit если не проходят валидацию
			"important" : function(field) {  			
				return true;
			},
			//Все телефоны (мобильные и домашнии) +7 111 111 11 11 или 11-11-11 (макс 11цифр)
			"phone" : function(field) {
				phone_number = clearString(field.val());
				if (!field.val()) return true;
				return phone_number.length > 5 && phone_number.match(/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{6,10}$/);
			},
			// мобильные телефоны (начинаются на +7 или 8)
			"mobile_rus" : function(field){
				phone_number = clearString(field.val());
				if (!field.val()) return true;
				return phone_number.length > 10 && phone_number.match(/^(8|\+7){1}(\d{10})$/);
			},
			
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
		mobile_rus: "Пожалуйста, введите корректный номер мобильного телефона.",
		inn: "Введите корректный ИНН.",
		inn_u: "Введите корректный ИНН юр лица.",
		inn_f: "Введите корректный ИНН физ лица.",
		ogrn: "Введите корректный ОГРН.",
		kpp: "Введите корректный КПП."
	}
/*
	Основной объект валидатора
*/	
	var citrusValidator = new function() {
		validator = this;

	  	validator.addFieldError = function(field, messagesList){
	  		var input_container = field.parents(".input-container");
	  		if(!field.hasClass('error-field')) {
				field.addClass('error-field first-validated');
				input_container.addClass('has-error')
								.removeClass('has-success');
			}

			messagesList = messagesList.join('<br>');
			var error_block = input_container.find(".error.help-block");	
			if(error_block.length > 0) {
				error_block.html(messagesList);
			} else {
				input_container.append('<div class="error help-block">'+messagesList+'</div>');
			}												 
							
	  	}
	  	validator.removeFieldError = function(field){
	  		field.removeClass('error-field')
	  			 .addClass('first-validated');
			field.parents(".input-container").removeClass('has-error')
						  					 .addClass('has-success')
						  					 .find(".error").remove();
	  	}
	  	validator.lockForm = function(form){
	  		form.find("[type='submit']").attr("disabled", "disabled");
	  	}
	  	validator.unlockForm = function(form){
	  		form.find("[type='submit']").removeAttr("disabled");
	  	}
	  	validator.validateField = function(field, action){
	  		//если true то добавляются обработчики ошибок   		
	  		var action = (typeof action === 'undefined') ? true : action;
			//делаем массив из названий правил валидации
			var validArray = field.data("valid").split(" ");			

			//errors будет хранить ошибки
			var errors = Array();
			validArray.forEach(function(rule_name, i, arr) {
				//если нет такого правила пишем ошибку
				if(!rules.hasOwnProperty(rule_name)) {
					console.log("citrusValidate: Нет правила для "+rule_name);
					return true;
				}
				//если не проходил валидацию добавляем в массив ошибку		
				if(!rules[rule_name](field)) errors.push(errorMessages[rule_name]);
			});

			//если есть ошибки то плохо
			if (errors.length > 0 ) {
				if(action) validator.addFieldError(field, errors);
				return false;
			} else {
				if(action) validator.removeFieldError(field);
				return true;
			}	  		  	  	 		
	  	};  	
	  	validator.validateForm = function(form){  		
	  		//сбор полей для валидации
		    var validFields = form.find("[data-valid]");
		    if( validFields.length == 0 ) return;

		    var form_valid = true; // по началу форма валидна
			validFields.each(function(index, el) {
				if( !validator.validateField($(this)) ) form_valid = false;
			});
			//если хоть одно поле не прошло валидацию добавляем класс к форме
			if(!form_valid) {
				form.addClass('not-valid');
				return false;
			}
			form.removeClass('not-valid');
			return true;
	  	}
	  	validator.checkImportant = function(form){
	  		//проверяем поля important
			var important_fields = form.find("[data-valid*='important']");
			var important_valid = true;

			if(important_fields.length > 0) {			
				important_fields.each(function(index, el) {
					if(!validator.validateField($(this), false)) important_valid = false;
				});
			}
			return important_valid;
	  	}
	}



//для удобного запуска валидатора
  $.fn.citrusValidate = function() {  		
  		$(this).each(function(index, el) { //в каждой форме
  			var form = $(this);
  			//обрабатываем каждое событие изменения элемента
	  		form.on('change', '[data-valid]', function(event) { 
				citrusValidator.validateField($(this));	
			});
			//если поле было первый раз провенено обрабатываем каждое введение буквы
	  		form.on('keyup', '.first-validated[data-valid]', function(event) { 
				citrusValidator.validateField($(this));	
			});
			//обрабаываем сабмит
			form.on('submit', function(event) {
				event.preventDefault();
				citrusValidator.validateForm($(this));
			});
			//проверка полей important
			if(!citrusValidator.checkImportant(form)) citrusValidator.lockForm(form);
			form.on('change', "[data-valid*='important']", function(event) {
				if(!citrusValidator.checkImportant(form)) {
					citrusValidator.lockForm(form);
				} else {
					citrusValidator.unlockForm(form);
				}
			});
  		});
  };
})( jQuery );



$(function() {
	//возможно добавлю эти параметры
	/*window.form1 = new citrusValidate($(".form-validate"), {
		onFieldError: function(field, error){

		},
		onFieldSuccess: function(field){

		}
	});*/

	//запускаем плагин
	$(".form-validate").citrusValidate();
});