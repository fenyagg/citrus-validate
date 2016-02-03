/*
 * CitrusValidator jQuery Plugin v0.6
 */
;(function( $ ){
/*
	Вспомогательные функции и объекты
*/	
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
		phone_full: "Пожалуйста, введите корректный номер телефона.",
		inn: "Введите корректный ИНН.",
		inn_u: "Введите корректный ИНН юр лица.",
		inn_f: "Введите корректный ИНН физ лица.",
		ogrn: "Введите корректный ОГРН.",
		kpp: "Введите корректный КПП."
	}
	//отчищает строку от (), пробелов, -
	function clearString(string){
		return string.replace(/\(|\)|\s+|-/g, "");
	}
	function formatMessage(message, arParams){
		if(message.length > 0 && arParams.length > 0) {			
			arParams.forEach(function(param, i){
				message = message.replace("{"+i+"}", param);
			});			
		}
		return message;
	}
	//основной объект с правилами валидации
	var rules = {
		"required" : function(field, action, callback) {
			var fieldNode = field.get(0);
			var isValid = fieldNode.type === 'checkbox' ? fieldNode.checked : fieldNode.type === 'radio' ? $('[name="' + fieldNode.name + '"]:checked').length : $.trim(fieldNode.value) !== '';

			var errors = isValid ? "" : errorMessages["required"];
			callback(field, errors);
		},
		//поля important блокируют submit если не проходят валидацию
		"important" : function(field, action, callback) {		
			callback(field);
		},
		//Все телефоны России (мобильные и домашнии) +7 111 111 11 11 или 11-11-11 (макс 11цифр)
		"phone" : function(field, action, callback) {	
			if(!field.val()) {callback(field); return true;};

			var value = clearString(field.val());
			var isValid = value.length > 5 && /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{6,10}$/.test(value);

			var errors = isValid ? "" : errorMessages["phone"];
			callback(field, errors);
		},
		// телефоны России (начинаются на +7 или 8)
		"phone_full" : function(field, action, callback){	
			if(!field.val()) {callback(field); return true;};			
			var value = clearString(field.val());
			var isValid = value.length > 10 && /^(8|\+7){1}(\d{10})$/.test(value);

			var errors = isValid ? "" : errorMessages["phone_full"];				
			callback(field, errors);
		},
		//post ajax запрос по пути data-ajax-url. Ответ строка с ошибкой
		"ajax": function(field, action, callback) {			
			if(!field.val()) {callback(field); return true;};

			var parthToAjax = $.trim(field.data("ajax-url"));	
			if(action) $.citrusValidator.lockField(field);
			if(parthToAjax.length > 0) {
				$.ajax({
					url: parthToAjax,
					type: 'POST',
					dataType: 'html',
					data: {name: field.attr("name"), value: field.val()},
				})
				.done(function(error) {
					if(action) $.citrusValidator.unlockField(field);
					if(error.length > 0) {callback(field, error); return;};
					callback(field);
				})
				.fail(function() {
					console.log("error");
					callback(field);
				});
			}
		},
		"email" : function(field, action, callback){	
			if(!field.val()) {callback(field); return true;};			
			var value = $.trim(field.val());
			var isValid = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);

			var errors = isValid ? "" : errorMessages["email"];				
			callback(field, errors);
		},
		"number" : function(field, action, callback){	
			if(!field.val()) {callback(field); return true;};
			var isNumber = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( field.val() );
			
			if(!isNumber) {callback(field, errorMessages["number"]); return;};

			var value = +field.val();
			//у числа получим max и min значение
			var min, max, errors = "", hasMinAttr = false, hasMaxAttr = false;
			if( typeof field.attr("min") !== "undefined" && field.attr("min") !== "" ) {min = +field.attr("min"); hasMinAttr = true;};
			if( typeof field.attr("max") !== "undefined" && field.attr("max") !== "") {max = +field.attr("max"); hasMaxAttr = true;};
			
			if( hasMinAttr && hasMaxAttr) {
				if( value < min || value > max ) errors = formatMessage(errorMessages["range"], [min, max]);
			} else {
				if( hasMinAttr ) {
					if(value < min) errors = formatMessage(errorMessages["min"], [min]);
				}
				if( hasMaxAttr ) {
					if(value > max) errors = formatMessage(errorMessages["max"], [max]);
				}
			}			
			callback(field, errors);
		},
	};


	
/*
* Основной объект валидатора
* Пример использования $.citrusValidator.validateForm($("form"))
*/	
$.citrusValidator = new function() {
	validator = this;

/*
*====================	Изменяемые функции через опции (в будущем) ====================
*/
  	validator.addFieldError = function(field){
  		var input_container = field.parents(".input-container");
  		if(!field.hasClass('error-field')) {
			field.addClass('error-field first-validated');
			input_container.addClass('has-error')
							.removeClass('has-success');
		}

		messagesList = field.errors.join('<br>');
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
  	validator.clearField = function(field){
  		field.removeClass('error-field');
		field.parents(".input-container").removeClass('has-error')
										 .removeClass('has-success')
										 .find(".error").remove();
  	}
  	validator.lockField = function(field){
  		validator.clearField(field);
  		field.attr("readonly", "readonly")
	 		 .closest('.input-container').addClass('ajax-loading');
  	}
  	validator.unlockField = function(field){
  		field.removeAttr("readonly")
			 .closest('.input-container').removeClass('ajax-loading');
  	}
  	validator.lockForm = function(form){
  		form.find("[type='submit']").attr("disabled", "disabled");
  	}
  	validator.unlockForm = function(form){
  		form.find("[type='submit']").removeAttr("disabled");
  	}

/**
* ====================	Основные функции плагина (ядро) ====================
*/
  	validator.validateField = function(field, action, callback){

  		var action = (typeof action === 'undefined') ? true : action;
		//	validArray =  массив из названий правил валидации
		var validArray = field.data("valid").split(" ");
		var callback = callback || function(){};
		//посчитаем все правила
		var validRulesLength = +validArray.length;			
		//errors будет хранить ошибки
		field.errors = Array();
		validArray.forEach(function(ruleName, i, arr) {
			//если нет такого правила пишем ошибку
			if(!rules.hasOwnProperty(ruleName)) {
				console.log("citrusValidate: Нет правила для "+ruleName);
				if(!(--validRulesLength)) {
					if(!field.isValid ) field.isValid = true;
					callback(field);
				}
				return true;
			}			
			//вызываем правило, колбэком проверям все ли правила проверены. Если все то отправляем на печать ошибок
			rules[ruleName](field, action, function(field, errors){
				var arErrors = errors || Array();
				if($.type(arErrors) === "string") arErrors = Array(arErrors);
				arErrors.forEach(function(error){
					field.errors.push(error);
				});
				//если последнее правило
				if(!(--validRulesLength)) {
					//errorHandler
					if (field.errors.length > 0 ) {
						if(action) validator.addFieldError(field);
						field.isValid = false;
					} else {
						if(action) validator.removeFieldError(field);
						field.isValid = true;
					}
					callback(field);
				}
			});							
		});	  	 		
  	};
  	/**
  	* каждое поле с атрибутом data-valid отправляет в валидацию поля. По окончанию callback(form)
  	* @form = jquery объект формы
  	* @action = если false не выводит никаких сообщений, только срабатывает callback(form) 
  	*/
  	validator.validateForm = function(form, action, callback){
  		var action = action || true;
  		var callback = callback || function(){};
  		//сбор полей для валидации
	    var validFields = form.find("[data-valid]");
	    countFields = validFields.length;
	    if( countFields == 0 ) {form.isValid = true; callback(form); return true};

	    var form_valid = true;
		validFields.each(function(index, el) {
			 validator.validateField($(this), action, function(field, isValid){
			 	if(!isValid) form_valid = false;			 	
			 	if(!(--countFields)) {
			 		form.isValid = form_valid ? true : false;
			 		callback(form);
			 		if(action) {			 			
			 			if(form_valid) {
			 				form.removeClass('not-valid');
			 			} else {
			 				form.addClass('not-valid');
			 			}
			 		}
			 	}
			 });			 
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
				validator.validateField($(this), false, function(field) {
					if (field.errors.length > 0 ) important_valid = false;
				});
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
	  			var field = $(this);
	  			if (field.data("valid").indexOf("important")+1) {
	  				if(!$.citrusValidator.checkImportant(form)) {
						$.citrusValidator.lockForm(form);
					} else {
						$.citrusValidator.unlockForm(form);
					}
	  			}
				$.citrusValidator.validateField(field);	
			});
			//если поле было первый раз провенено обрабатываем каждое введение буквы
	  		form.on('keyup', ".first-validated[data-valid]:not([data-valid*='ajax'])", function(event) { 
				$.citrusValidator.validateField($(this));	
			});
			//обрабаываем сабмит
			form.on('submit', function(event) {
				event.preventDefault();
				$.citrusValidator.validateForm($(this));
			});
			//проверка полей important
			if(!$.citrusValidator.checkImportant(form)) $.citrusValidator.lockForm(form);
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