/*
 * CitrusValidator jQuery Plugin v0.2b
 * Пример использования citrusValidator
 * var form = new citrusValidator($(form));
 */


/* ===== Вспомогательные функции для конирования объектов и функций.
Function.prototype.clone = function() {
    var fct = this;
    var clone = function() {
        return fct.apply(this, arguments);
    };
    clone.prototype = fct.prototype;
    for (property in fct) {
        if (fct.hasOwnProperty(property) && property !== 'prototype') {
            clone[property] = fct[property];
        }
    }
    return clone;
};*/
function clone(obj){
    if(obj == null || typeof(obj) != 'object') return obj;    
    var temp = new obj.constructor(); 
    for(var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}

;(function( $ ){
	"use strict";

var obMessages = {
	required: "Это поле необходимо заполнить.",
	remote: "Пожалуйста, введите правильное значение.",
	email: "Пожалуйста, введите корректный адрес электронной почты.",
	url: "Пожалуйста, введите корректный URL.",
	date: "Пожалуйста, введите корректную дату.",
	dateISO: "Пожалуйста, введите корректную дату в формате ISO.",
	number: "Пожалуйста, введите число.",
	digits: "Пожалуйста, вводите только цифры.",
	creditcard: "Пожалуйста, введите правильный номер кредитной карты.",
	confirm_password: "Пароли не совпадают.",
	extension: "Пожалуйста, выберите файл с правильным расширением.",
	maxlength: "Пожалуйста, введите не больше {0} символов.",
	minlength: "Пожалуйста, введите не меньше {0} символов.",
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
	kpp: "Введите корректный КПП.",
}	
//отчищает строку от (), пробелов, -
function clearString(string){
	return string.replace(/\(|\)|\s+|-/g, "");
}
// Правила валидации
var obRules = {
	"required" : function(field, action, callback) {
		var fieldNode = field.get(0);
		var isValid = fieldNode.type === 'checkbox' ? fieldNode.checked : fieldNode.type === 'radio' ? $('[name="' + fieldNode.name + '"]:checked').length : $.trim(fieldNode.value) !== '';

		var errors = isValid ? "" : this.getMessage("required");
		callback(field, errors);
	},
	//поля important блокируют submit если не проходят валидацию
	"important" : function(field, action, callback) {		
		callback(field);
	},
	//Все телефоны России (федеральные и коротие) +7 111 111 11 11 или 11-11-11 (макс 11цифр)
	"phone" : function(field, action, callback) {
		if(!field.val()) {callback(field); return true;};

		var value = clearString(field.val());
		var isValid = value.length > 5 && /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{6,10}$/.test(value);

		var errors = isValid ? "" : this.getMessage("phone");
		callback(field, errors);
	},
	// телефоны России (начинаются на +7 или 8)
	"phone_full" : function(field, action, callback){	
		if(!field.val()) {callback(field); return true;};			
		var value = clearString(field.val());
		var isValid = value.length > 10 && /^(8|\+7){1}(\d{10})$/.test(value);

		var errors = isValid ? "" : this.getMessage("phone_full");				
		callback(field, errors);
	},
	//post ajax запрос по пути data-ajax-url. Ответ строка с ошибкой
	"ajax": function(field, action, callback) {			
		if(!field.val()) {callback(field); return true;};
		var validator = this;
		var parthToAjax = $.trim(field.data("ajax-url"));	
		if(action) validator.callEvent("lockField", field);
		if(parthToAjax.length > 0) {
			$.ajax({
				url: parthToAjax,
				type: 'POST',
				dataType: 'html',
				data: {name: field.attr("name"), value: field.val()},
			})
			.done(function(error) {
				if(action) validator.callEvent("unlockField", field);
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

		var errors = isValid ? "" : this.getMessage("email");				
		callback(field, errors);
	},
	//число + проверяет max, min параметры
	"number" : function(field, action, callback){	
		if(!field.val()) {callback(field); return true;};
		var isNumber = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( field.val() );
		
		if(!isNumber) {callback(field, this.getMessage("number")); return;};

		var value = +field.val();
		//у числа получим max и min значение
		var min, max, errors = "", hasMinAttr = false, hasMaxAttr = false;
		if( typeof field.attr("min") !== "undefined" && field.attr("min") !== "" ) {min = +field.attr("min"); hasMinAttr = true;};
		if( typeof field.attr("max") !== "undefined" && field.attr("max") !== "") {max = +field.attr("max"); hasMaxAttr = true;};
		
		if( hasMinAttr && hasMaxAttr) {
			if( value < min || value > max ) errors = this.getMessage("range", [min, max]);
		} else {
			if( hasMinAttr ) {
				if(value < min) errors = this.getMessage("min", [min]);
			}
			if( hasMaxAttr ) {
				if(value > max) errors = this.getMessage("max", [max]);
			}
		}			
		callback(field, errors);
	},
	"length" : function(field, action, callback) {
		if(!field.val()) {callback(field); return true;};

		var dataMinlength = field.data("minlength"),
			dataMaxlength = field.data("maxlength"),
			valLength = field.val().length,
			errors = false;
		console.log(dataMaxlength);
		if(typeof dataMinlength !== "undefined" && typeof dataMaxlength !== "undefined") {
			if(valLength > dataMaxlength || valLength < dataMinlength) {
				errors = this.getMessage("rangelength" , [dataMinlength, dataMaxlength]);
			}			
		} else if(typeof dataMinlength !== "undefined"){
			if(valLength < dataMinlength) errors = this.getMessage("minlength" , [dataMinlength]);
		} else if(typeof dataMaxlength !== "undefined"){
			if(valLength > dataMaxlength) errors = this.getMessage("maxlength" , [dataMaxlength]);
		}
		callback(field, errors);
	},
	"main_password": function(field, action, callback){
		var target = field.parents("form").find("[data-valid*='confirm_password']");			
		if(!!target.val() && !!field.val() ) this.validateField(target);
		callback(field);
	},
	"confirm_password": function(field, action, callback){
		if(!field.val()) {callback(field); return true;};
		var target = field.parents("form").find("[data-valid*='main_password']");
		var isValid = (field.val() === target.val());
		var errors = isValid ? "" : this.getMessage("confirm_password");
		callback(field, errors);	
	},
	"url": function(field, action, callback) {
		if(!field.val()) {callback(field); return true;};
		var isValid = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( field.val() );
		var errors = isValid ? "" : this.getMessage("url");				
		callback(field, errors);
	},
	// ИНН юр и физ лица
	"inn": function(field, action, callback){
		if(!field.val()) {callback(field); return true;};
		var value = field.val();
		var isValid = true;

	    // проверка на число
	    if (value.match(/\D/)) {
	        isValid = false;
	    } else {
	    	// проверка на 10 и 12 цифр
		    if (value.length != 12 && value.length != 10) isValid = false;
		    // проверка по контрольным цифрам
		    if (value.length == 10) {
		        var dgt10 = String(((
		            2 * value[0] + 4 * value[1] + 10 * value[2] +
		            3 * value[3] + 5 * value[4] + 9 * value[5] +
		            4 * value[6] + 6 * value[7] + 8 * value[8]) % 11) % 10);
		        if (value[9] == dgt10) {
		            isValid =  true;
		        }
		        else {
		            isValid = false;
		        }
		    }
		    if (value.length == 12) {
		        var dgt11 = String(((
		            7 * value[0] + 2 * value[1] + 4 * value[2] +
		            10 * value[3] + 3 * value[4] + 5 * value[5] +
		            9 * value[6] + 4 * value[7] + 6 * value[8] +
		            8 * value[9]) % 11) % 10);
		        var dgt12 = String(((
		            3 * value[0] + 7 * value[1] + 2 * value[2] +
		            4 * value[3] + 10 * value[4] + 3 * value[5] +
		            5 * value[6] + 9 * value[7] + 4 * value[8] +
		            6 * value[9] + 8 * value[10]) % 11) % 10);
		        if (value[10] == dgt11 && value[11] == dgt12) {
		            isValid = true;
		        }
		        else {
		            isValid = false;
		        }
		    }
	    }
	    var errors = isValid ? "" : this.getMessage("inn");				
		callback(field, errors);
	},
	"inn_u": function(field, action, callback){
		if(!field.val()) {callback(field); return true;};
		var value = field.val();
		var isValid = true;

		 // проверка на число
	    if (value.match(/\D/)) {
	        isValid = false;
	    }
	    // проверка на 10 цифр
	    if (value.length != 10)   isValid = false;

		var dgt10 = String(((
		    2 * value[0] + 4 * value[1] + 10 * value[2] +
		    3 * value[3] + 5 * value[4] + 9 * value[5] +
		    4 * value[6] + 6 * value[7] + 8 * value[8]) % 11) % 10);
		if (value[9] == dgt10) {
		    isValid = true;
		}
		else {		
		    isValid = false;
		}
		var errors = isValid ? "" : this.getMessage("inn_u");				
		callback(field, errors);
	},
	"inn_f": function(field, action, callback){
		if(!field.val()) {callback(field); return true;};
		var value = field.val();
		var isValid = true;

	    // проверка на число
	    if (value.match(/\D/)) {
	        isValid = false;
	    }				
		if((value.length == 12) && ((value[10] == ((7 * value[ 0] + 2 * value[1] + 4 * value[2] + 10 * value[3] + 3 * value[4] + 5 * value[5] + 9 * value[6] + 4 * value[7] + 6 * value[8] + 8 * value[9]) % 11) % 10) && (value[11] == ((3 * value[ 0] + 7 * value[1] + 2 * value[2] + 4 * value[3] + 10 * value[4] + 3 * value[5] + 5 * value[6] + 9 * value[7] + 4 * value[8] + 6 * value[9] + 8 * value[10]) % 11) % 10))){
	        isValid = true;
	    }else{
	        isValid = false;
	    }		    	
		var errors = isValid ? "" : this.getMessage("inn_f");				
		callback(field, errors);
	},
	"ogrn": function(field, action, callback){
		if(!field.val()) {callback(field); return true;};
		var value = field.val();
		var isValid = true;

		//для ОГРН в 13 знаков
		if(value.length == 13 && (value.slice(-1) == ((value.slice(0,-1))%11 + '').slice(-1))){
		    isValid = true;			 
		//для ОГРН в 15 знаков
		}else if(value.length == 15 && (value.slice(-1) == ((value.slice(0,-1))%13 + '').slice(-1))){
		    isValid = true;
		}else{
		    isValid = false;
		}
		var errors = isValid ? "" : this.getMessage("ogrn");				
		callback(field, errors);
	},
	"kpp": function(field, action, callback){
		if(!field.val()) {callback(field); return true;};
		var value = field.val();
		var isValid = true;

		// проверка на число
		if (value.match(/\D/)) {
	        isValid = false;
	    }

		if(!value.match(/([0-9]{1}[1-9]{1}|[1-9]{1}[0-9]{1})([0-9]{2})([0-9A-F]{2})([0-9]{3})/)){
			isValid = false;
		}
		var errors = isValid ? "" : this.getMessage("kpp");				
		callback(field, errors);
		
	}
};// end rules

//события по умолчанию
var obEvents = {
	addFieldError: function(field){
		var input_container = field.parents(".input-container");
  		if(!field.hasClass('error-field')) {
			field.addClass('error-field');
			input_container.addClass('has-error')
							.removeClass('has-success');
		}

		var messagesList = field.errors.join('<br>');
		var error_block = input_container.find(".error.help-block");	
		if(error_block.length > 0) {
			error_block.html(messagesList);
		} else {
			input_container.append('<div class="error help-block">'+messagesList+'</div>');
		}
	},
	removeFieldError: function(field){
		this.callEvent("clearField", field);
		field.parents(".input-container").addClass('has-success');
	},
	clearField: function(field) {
		field.removeClass('error-field');
		field.parents(".input-container").removeClass('has-error')
										 .removeClass('has-success')
									 	 .find(".error").remove();
	},
	lockField: function(field) {
		this.callEvent("clearField", field);
		field.attr("readonly", "readonly")
 		 	 .closest('.input-container').addClass('ajax-loading');
	},
	unlockField: function(field){
		field.removeAttr("readonly")
		 	 .closest('.input-container').removeClass('ajax-loading');
	},
	lockForm: function(form){
  		form.find("[type='submit']").attr("disabled", "disabled");
  	},
  	unlockForm: function(form){
  		form.find("[type='submit']").removeAttr("disabled");
  	},
  	afterFormValidate: function(form){
  		if(form.isValid) form.submit();
  	}
}
/*
* Прототип всех форм. Использование как citrusValidator.prototype 
*/
var proto = new function(){	
	
	/*	
	*	возвращает сообщение messageName отоформатированное массивом arParams
	* 	или все сообщения если messageName пустое
	*/
	this._getMessage = function(messageName, arParams){
		if(obMessages[messageName] && obMessages[messageName].length > 0) {	
			var message = obMessages[messageName];
			if(arParams && arParams.length > 0) {				
				arParams.forEach(function(param, i){
					message = message.replace("{"+i+"}", param);
				});	
				return message;
			} 
			return message;							
		}
		if(!obMessages[messageName]) return obMessages;
	}
	this._setMessage = function(messageName, messageText){
		if(messageName && messageName.length > 0 && messageText ) {
			messageText +="";
			if(messageText.length > 0) {
				obMessages[messageName] = messageText;
			}
		}
	}
	this._getRule = function(ruleName){
		if( !ruleName ) return obRules;
		return obRules[ruleName] || false;
	}
	this._setRule = function(ruleName, fn){
		if(!ruleName || !$.isFunction(fn) ) return;
		obRules[ruleName] = fn;
	}
	this._setRules = function(obRules){
		if( $.type(obRules) !== "object" && !$.isEmptyObject(obRules)) return;
		for (var ruleName in obRules) {
			this._setRule(ruleName, obRules[ruleName]);
		}
	}
	this._getEvent = function(eventName){
		if( !eventName ) return obEvents;
		return obEvents[eventName] || function(){};
	}
	this._setEvent = function(eventName, fn){
		if(!eventName || !$.isFunction(fn) ) return;
		obEvents[eventName] = fn;
	}
	this._setEvents = function(obEvents){
		if( $.type(obEvents) !== "object" && !$.isEmptyObject(obEvents)) return;
		for (var eventName in obEvents) {
			this._setEvent(eventName, obEvents[eventName]);
		}
	}
	
};

/*
* Конструктор валидатора. Для каждой формы будет свой объект.
*/
window.citrusValidator = function (form, params) {	
	if(!form || !form.length) return {};

	var validator = this,
		obRules = clone(validator._getRule()),
		obMessages = clone(validator._getMessage()),
		obEvents = clone(validator._getEvent());

	validator.jqForm = form;

  	validator.getMessage = function(messageName, arParams){
  		var message = obMessages[messageName] || validator._getMessage(messageName) || "";
		if(message.length > 0 && $.type(arParams) === "array" && arParams.length > 0) {
			arParams.forEach(function(param, i){
				message = message.replace("{"+i+"}", param);
			});				
		}
		return message;	
	}
	validator.setMessage = function(messageName, messageText){	
		if(messageName && messageName.length > 0 && messageText ) {
			messageText +="";
			if(messageText.length > 0) {
				obMessages[messageName] = messageText;
				return true;
			}
		}	
	}
	validator.getRule = function(ruleName){		
		if( !ruleName ) return obRules;
		return obRules[ruleName] || validator._getRule(ruleName) || false;
	}
	validator.setRule = function(ruleName, fn){		
		if(!ruleName || !$.isFunction(fn) ) return;
		obRules[ruleName] = fn;
		return true;
	}
	validator.getEvent = function(eventName){
		if( !eventName ) return obEvents;
		return obEvents[eventName] || _getEvent(eventName) || false;
	}
	validator.setEvent = function(eventName, fn){
		if(!eventName || !$.isFunction(fn) ) return;
		obEvents[eventName] = fn;
	}
	validator.setEvents = function(obEvents){
		if( $.type(obEvents) !== "object" && !$.isEmptyObject(obEvents)) return;
		for (var eventName in obEvents) {
			this._setEvent(eventName, obEvents[eventName]);
		}
		return true;
	}
	validator.callEvent = function(eventName, arg){
		if( !eventName ) return;
		this.getEvent(eventName).call(this, arg);
	}


	/**
	* ====================	Основные функции плагина ====================
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
			var fnRule = validator.getRule(ruleName);
			//если нет такого правила пишем ошибку
			if(!fnRule) {
				console.log("citrusValidator: Нет правила для "+ruleName);
				if(!(--validRulesLength)) {					
					if(field.isValid !== false ) {
						field.data("isvalid", true);
						field.isValid = true;
					}
					callback(field);
				}
				return true;
			}
			//вызываем правило, колбэком проверям все ли правила проверены. Если все то вызываем событие
			fnRule.call( validator, field, action, function(field, errors){
				var arErrors = errors || Array();
				if($.type(arErrors) === "string") arErrors = Array(arErrors);
				arErrors.forEach(function(error){
					field.errors.push(error);
				});
				//если последнее правило
				if(!(--validRulesLength)) {
					//errorHandler
					if (field.errors.length > 0 ) {
						if(action) validator.callEvent("addFieldError", field);
						field.isValid = false;
					} else {
						var inputType = field.attr("type");
						if(action) {
							if(inputType !== "checkbox" && inputType !== "radio" &&  !field.val()) {
								validator.callEvent("clearField", field);
							}else {
								validator.callEvent("removeFieldError", field);
							}
						}						
						field.isValid = true;
					}
					field.data("isvalid", field.isValid);
					callback(field);
				}
			});							
		});	  	 		
  	};
  	/**
  	* каждое поле с атрибутом data-valid отправляет в валидацию поля. По окончанию callback(form)
  	* @action = если false не выводит никаких сообщений, только срабатывает callback(form) 
  	*/
  	validator.validateForm = function( action, callback){
  		var action = (typeof action === 'undefined') ? true : action;
  		var callback = callback || function(){};
  		//сбор полей для валидации
	    var validFields = validator.jqForm.find("[data-valid]");
	    var countFields = validFields.length;
	    if( countFields == 0 ) {validator.jqForm.isValid = true; callback(validator.jqForm); return true};

	    validator.jqForm.isValid = true; validator.jqForm.invalidFields = Array();
		validFields.each(function(index, el) {
			var field = $(this);
			if($.type(field.data("isvalid")) !== "undefined") {
				if(!field.data("isvalid")) {
					validator.jqForm.isValid = false;
					validator.jqForm.invalidFields.push(field);
				}
				if(!(--countFields)) {
					callback(validator.jqForm);
					if(action) validator.callEvent("afterFormValidate", validator.jqForm);
				}				
			} else {
				validator.validateField(field, action, function(field){
					if(!field.isValid) {
						validator.jqForm.isValid = false;
						validator.jqForm.invalidFields.push(field);
					}
					if(!(--countFields)) {
						callback(validator.jqForm);
						if(action) validator.callEvent("afterFormValidate", validator.jqForm);
					}
				});	
			}					 
		});
  	}  	
  	validator.checkImportant = function(){  		
		var important_fields = validator.jqForm.find("[data-valid*='important']");

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
  	//init
  	;(function(){
  		//обрабатываются события change и keyup. По умолчанию change меняется на keyup после первой валидации. Можно установить через data-validate-trigger у каждого поля
  		validator.jqForm.on('change keyup', '[data-valid]', function(event) {
  			var field = $(this);
  			var validateTrigger = field.data("validate-trigger") || "change";
  			if( validateTrigger.indexOf(event.type) < 0  ) return;

  			if (field.data("valid").indexOf("important")+1) {
  				if(!validator.checkImportant()) {
					validator.callEvent("lockForm", validator.jqForm);
				} else {
					validator.callEvent("unlockForm", validator.jqForm);
				}
				return;
  			}  			
  			validator.validateField($(this), true, function(field){
  				if(!field.data("validate-trigger")) field.data("validate-trigger", "keyup");
  			});
  		});
		
		//обрабаываем сабмит
		validator.jqForm.on('click', ":submit", function(event) {
			event.preventDefault();
			validator.validateForm();
		});
		//проверка полей important
		if(!validator.checkImportant(validator.jqForm)) validator.callEvent("lockForm", validator.jqForm);
  	})();
}

citrusValidator.prototype = proto;
})( jQuery );

