/*
 * CitrusValidator jQuery Plugin
 * https://github.com/fenyagg/citrus-validate
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
};
>>>>>>> origin/master:jquery.citrusValidator.js
function clone(obj){
    if(obj == null || typeof(obj) != 'object') return obj;
    var temp = new obj.constructor();
    for(var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}*/

;(function( $ ){
	"use strict";

	//ie9 fix
	if (!Object.create) {
	  Object.create = function(proto) {
	    function F() {}
	    F.prototype = proto;
	    return new F;
	  };
	}

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
	phone_all: "Пожалуйста, введите корректный номер телефона.",
	phone: "Пожалуйста, введите корректный номер телефона.",
	inn: "Введите корректный ИНН.",
	inn_u: "Введите корректный ИНН юр лица.",
	inn_f: "Введите корректный ИНН физ лица.",
	ogrn: "Введите корректный ОГРН.",
	kpp: "Введите корректный КПП.",
	filetype: "Не верный тип файла. Возможные типы: {0}."
}
//отчищает строку от (), пробелов, -
function clearString(string){
	return string.replace(/\(|\)|\s+|-/g, "");
}
// Правила валидации
var obRules = {
	"file" : function(Vfield, callback) {
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};

		var ifTypeValid = true;
		for (var i = 0; i < field.get(0).files.length; i++) {
			var file = field[0].files[i];
			if ('name' in file) {
				var ext = file.name.split(".");
				ext = ext[ext.length-1].toLocaleLowerCase();
				if( ! (Vfield.params.filetype.indexOf(ext)+1) ) ifTypeValid = false;
			}
		}

		var errors = ifTypeValid ? "" : this.getMessage.call(Vfield,"filetype", [Vfield.params.filetype]);
		callback(Vfield, errors);
	},
	"required" : function(Vfield, callback) {
		var fieldNode = Vfield.$el.get(0);
		var isValid = fieldNode.type === 'checkbox' ? fieldNode.checked : fieldNode.type === 'radio' ? $('[name="' + fieldNode.name + '"]:checked').length : $.trim(fieldNode.value) !== '';

		var errors = isValid ? "" : this.getMessage.call(Vfield,"required");
		callback(Vfield, errors);
	},
	//поля important блокируют submit если не проходят валидацию
	"important" : function(Vfield, callback) {
		callback(Vfield);
	},
	//Все телефоны России (федеральные и коротие) +7 111 111 11 11 или 11-11-11 (макс 11цифр)
	"phone_all" : function(Vfield, callback) {
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};

		var value = clearString(field.val());
		var isValid = value.length > 5 && /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{6,10}$/.test(value);

		var errors = isValid ? "" : this.getMessage.call(Vfield,"phone_all");
		callback(Vfield, errors);
	},
	// телефоны России (начинаются на +7 или 8)
	"phone" : function(Vfield, callback){
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};
		var value = clearString(field.val());
		var isValid = value.length > 10 && /^(8|\+7){1}(\d{10})$/.test(value);

		var errors = isValid ? "" : this.getMessage.call(Vfield,"phone");
		callback(Vfield, errors);
	},
	//post ajax запрос по пути ajax-url. Ответ строка с ошибкой
	"ajax": function(Vfield, callback) {
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};
		var validator = this;
		var parthToAjax = Vfield.params.ajaxUrl;
		if(parthToAjax.length > 0) {
			$.ajax({
				url: parthToAjax,
				type: 'POST',
				dataType: 'html',
				data: {name: field.attr("name"), value: field.val()},
			})
			.done(function(error) {
				if(error.length > 0) {callback(Vfield, error); return;};
				callback(Vfield);
			})
			.fail(function() {
				console.error("error");
				callback(Vfield);
			});
		}
	},
	"email" : function(Vfield, callback){
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};
		var value = $.trim(field.val());
		var isValid =  /^(|(([A-Za-z0-9]+_+)|([A-Za-z0-9]+\-+)|([A-Za-z0-9]+\.+)|([A-Za-z0-9]+\++))*[A-Za-z0-9]+@((\w+\-+)|(\w+\.))*\w{1,63}\.[a-zA-Z]{2,6})$/.test(value);

		var errors = isValid ? "" : this.getMessage.call(Vfield,"email");
		callback(Vfield, errors);
	},
	//число + проверяет max, min параметры
	"number" : function(Vfield, callback){
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};
		var isNumber = /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test( field.val() );

		if(!isNumber) {callback(Vfield, this.getMessage.call(Vfield,"number")); return;};

		var value = +field.val();
		//у числа получим max и min значение
		var min, max, errors = "", hasMinAttr = false, hasMaxAttr = false;
		if( typeof Vfield.params.min !== "undefined" && Vfield.params.min !== "" ) {min = +Vfield.params.min; hasMinAttr = true;};
		if( typeof Vfield.params.max !== "undefined" && Vfield.params.max !== "") {max = +Vfield.params.max; hasMaxAttr = true;};

		if( hasMinAttr && hasMaxAttr) {
			if( value < min || value > max ) errors = this.getMessage.call(Vfield,"range", [min, max]);
		} else {
			if( hasMinAttr ) {
				if(value < min) errors = this.getMessage.call(Vfield,"min", [min]);
			}
			if( hasMaxAttr ) {
				if(value > max) errors = this.getMessage.call(Vfield,"max", [max]);
			}
		}
		callback(Vfield, errors);
	},
	"length" : function(Vfield, callback) {
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};

		var dataMinlength = Vfield.params.minlength,
			dataMaxlength = Vfield.params.maxlength,
			valLength = field.val().length,
			errors = false;
		if(typeof dataMinlength !== "undefined" && typeof dataMaxlength !== "undefined") {
			if(valLength > dataMaxlength || valLength < dataMinlength) {
				errors = this.getMessage.call(Vfield,"rangelength" , [dataMinlength, dataMaxlength]);
			}
		} else if(typeof dataMinlength !== "undefined"){
			if(valLength < dataMinlength) errors = this.getMessage.call(Vfield,"minlength" , [dataMinlength]);
		} else if(typeof dataMaxlength !== "undefined"){
			if(valLength > dataMaxlength) errors = this.getMessage.call(Vfield,"maxlength" , [dataMaxlength]);
		}
		callback(Vfield, errors);
	},
	"main_password": function(Vfield, callback){
		var field = Vfield.$el;

		//проверяем повтор пароля
		var target = this.filterField(function(field){return $.inArray( "confirm_password", field.arRules)+1})[0];
		if(!!target.$el.val() && !!field.val() ) this.validateField(target);

		callback(Vfield);
	},
	"confirm_password": function(Vfield, callback){
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};
		var target = field.parents("form").find("[data-valid*='main_password']");
		var isValid = (field.val() === target.val());
		var errors = isValid ? "" : this.getMessage.call(Vfield,"confirm_password");
		callback(Vfield, errors);
	},
	"url": function(Vfield, callback) {
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};
		var isValid = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test( field.val() );
		var errors = isValid ? "" : this.getMessage.call(Vfield,"url");
		callback(Vfield, errors);
	},
	// ИНН юр и физ лица
	"inn": function(Vfield, callback){
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};
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
	    var errors = isValid ? "" : this.getMessage.call(Vfield,"inn");
		callback(Vfield, errors);
	},
	"inn_u": function(Vfield, callback){
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};
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
		var errors = isValid ? "" : this.getMessage.call(Vfield,"inn_u");
		callback(Vfield, errors);
	},
	"inn_f": function(Vfield, callback){
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};
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
		var errors = isValid ? "" : this.getMessage.call(Vfield,"inn_f");
		callback(Vfield, errors);
	},
	"ogrn": function(Vfield, callback){
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};
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
		var errors = isValid ? "" : this.getMessage.call(Vfield,"ogrn");
		callback(Vfield, errors);
	},
	"kpp": function(Vfield, callback){
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};
		var value = field.val();
		var isValid = true;

		// проверка на число
		if (value.match(/\D/)) {
	        isValid = false;
	    }

		if(!value.match(/([0-9]{1}[1-9]{1}|[1-9]{1}[0-9]{1})([0-9]{2})([0-9A-F]{2})([0-9]{3})/)){
			isValid = false;
		}
		var errors = isValid ? "" : this.getMessage.call(Vfield,"kpp");
		callback(Vfield, errors);
	},
};// end rules

//события по умолчанию
var obEvents = {
	addFieldError: function($field, arErrors){
		var input_container = $field.parents(".input-container");

		input_container.addClass('has-error')
						.removeClass('has-success');

		var messagesList = arErrors.join('<br>');
		var error_block = input_container.find(".error.help-block");
		if(error_block.length > 0) {
			error_block.html(messagesList);
		} else {
			input_container.append('<div class="error help-block">'+messagesList+'</div>');
		}
	},
	removeFieldError: function($field){
		$field.parents(".input-container").removeClass('has-error')
										  .addClass('has-success');
	},
	clearField: function($field) {
		$field.parents(".input-container").removeClass('has-error')
					   					  .removeClass('has-success');
	},
	lockField: function($field) {
		this.callEvent("removeFieldError", $field);
		$field.attr("readonly", "readonly")
 		 	  .closest('.input-container').addClass('ajax-loading');
	},
	unlockField: function($field){
		$field.removeAttr("readonly")
		 	  .closest('.input-container').removeClass('ajax-loading');
	},
	lockForm: function(){
		var v = this;
		v.isLocked = true;
		v.$form.find(v.settings['submitBtn']).attr("disabled", "disabled");
  	},
  	unlockForm: function(){
  		var v = this;
  		v.isLocked = false;
  		v.$form.find(v.settings['submitBtn']).removeAttr("disabled");
  	},
  	afterFormValidate: function(){
  		if(this.isValid) this.$form.submit();
  	},
  	scrollToFirstError: function(){
  		var errorFileds = this.filterField(function(field){return field.isValid === false});
  		if(errorFileds.length) errorFileds[0].$el.first().focus();
  	},
  	reset: function () {
  		var v = this;
  		v.$form[0].reset();
  		v.fields.forEach(function(Vfield, i, arr) {
  			v.callEvent("clearField", Vfield.$el);
  			delete Vfield.isValid;
  		});
  		v.callEvent(v.checkImportant() ? "unlockForm":"lockForm");
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
	this._setMessage = function(messages, messageText){
		if(arguments.length === 1 && $.isPlainObject(messages) && !$.isEmptyObject(messages)) {
			for (var prName in messages) {
				if(typeof messages[prName] !== "string") return false;
				obMessages[prName] = messages[prName];
			}
			return true;
		} else if( arguments.length === 2 && typeof messages === "string" && typeof messageText === "string") {
			obMessages[messages] = messageText;
			return true;
		}
		return false;
	}
	this._getRule = function(ruleName){
		if( !ruleName ) return obRules;
		return obRules[ruleName] || false;
	}
	this._setRule = function(rules, fn){
		if(arguments.length === 1 && $.isPlainObject(rules) && !$.isEmptyObject(rules)) {
			for (var prName in rules) {
				if(!$.isFunction(rules[prName])) return false;
				obRules[prName] = rules[prName];
			}
			return true;
		} else if( arguments.length === 2 && typeof rules === "string" && $.isFunction(fn)) {
			obRules[rules] = fn;
			return true;
		}
		return false;
	}
	this._getEvent = function(eventName){
		if( !eventName ) return obEvents;
		return obEvents[eventName] || function(){};
	}
	this._setEvent = function(events, fn){
		if(arguments.length === 1 && $.isPlainObject(events) && !$.isEmptyObject(events)) {
			for (var prName in events) {
				if(typeof prName !== "string" || !$.isFunction(events[prName])) return false;
				obEvents[prName] = events[prName];
			}
			return true;
		} else if( arguments.length === 2 && typeof events === "string" && $.isFunction(fn)) {
			obEvents[events] = fn;
			return true;
		}
		return false;
	}
};

/*
* Конструктор валидатора. Для каждой формы будет свой объект.
*/
window.citrusValidator = function (form, options) {
	if(!form || form.length != 1) throw new Error("citrusValidator: ошибка в аргументе form");

	var validator = this,
		obRules = Object.create(validator._getRule()),
		obMessages = Object.create(validator._getMessage()),
		obEvents = Object.create(validator._getEvent());

	validator.settings = $.extend( {
	      'submitBtn': ':submit'
	    }, options);

	validator.$form = form;
	validator.fields = Array();
	validator.isLocked = false;

  	validator.getMessage = function(messageName, arParams){
  		var message = this.messages && this.messages[messageName] ? this.messages[messageName] :  obMessages[messageName] ? obMessages[messageName] : "";

		if(message.length > 0 && $.type(arParams) === "array" && arParams.length > 0) {
			arParams.forEach(function(param, i){
				message = message.replace("{"+i+"}", param);
			});
		}
		return message;
	}
	validator.setMessage = function(messages, messageText){
		if(arguments.length === 1 && $.isPlainObject(messages) && !$.isEmptyObject(messages)) {
			for (var prName in messages) {
				if(typeof messages[prName] !== "string") return false;
				obMessages[prName] = messages[prName];
			}
			return true;
		} else if( arguments.length === 2 && typeof messages === "string" && typeof messageText === "string") {
			obMessages[messages] = messageText;
			return true;
		}
		return false;
	}
	validator.getRule = function(ruleName){
		return !ruleName ? obRules: obRules[ruleName] || false;
	}
	validator.setRule = function(rules, fn){
		if(arguments.length === 1 && $.isPlainObject(rules) && !$.isEmptyObject(rules)) {
			for (var prName in rules) {
				if(!$.isFunction(rules[prName])) return false;
				obRules[prName] = rules[prName];
			}
			return true;
		} else if( arguments.length === 2 && typeof rules === "string" && $.isFunction(fn)) {
			obRules[rules] = fn;
			return true;
		}
		return false;
	}
	validator.getEvent = function(eventName){
		if( !eventName ) return obEvents;
		return obEvents[eventName] || false;
	}
	validator.setEvent = function(events, fn){
		if(arguments.length === 1 && $.isPlainObject(events) && !$.isEmptyObject(events)) {
			for (var prName in events) {
				if(typeof prName !== "string" || !$.isFunction(events[prName])) return false;
				obEvents[prName] = events[prName];
			}
			return true;
		} else if( arguments.length === 2 && typeof events === "string" && $.isFunction(fn)) {
			obEvents[events] = fn;
			return true;
		}
		return false;
	}
	validator.callEvent = function(eventName, arg1, arg2){
		if( !eventName ) return;
		this.getEvent(eventName).call(this, arg1, arg2);
		return this;
	}


	/**
	* ====================	Основные функции плагина ====================
	*/
	//Vfield массив из функции getField
  	validator.validateField = function(Vfield, action, callback){
  		var Vfield = $.isArray(Vfield) ? Vfield : Array(Vfield),
  			action = action === undefined ? true : action,
  			callback = callback || function(){};

  		Vfield.forEach(function(Vfield){
  			if(Vfield.params.lockOnValid) validator.callEvent("lockField", Vfield.$el);

  			var arRulesLength = Vfield.arRules.length,
  				arErrors = Array(),
  				isValid;

			function onComplete () {
				if(Vfield.params.lockOnValid) validator.callEvent("unlockField", Vfield.$el);
					Vfield.errors = arErrors;
				if(!Vfield.params.trigger && !Vfield.$el.is(":checkbox, :file, :radio, select") ) Vfield.params.trigger = "keyup";

				if (arErrors.length > 0 ) {
					if(action) validator.callEvent("addFieldError", Vfield.$el, arErrors);
					Vfield.$el.trigger("validError", [Vfield]);
					Vfield.isValid = false;
				} else {
					if( !Vfield.$el.is(":checkbox, :radio") && !Vfield.$el.val() ) {
						if(action) validator.callEvent("clearField", Vfield.$el);
						delete  Vfield.isValid;
					}else {
						if(action) validator.callEvent("removeFieldError", Vfield.$el);
						Vfield.$el.trigger("validSucess", [Vfield]);
						Vfield.isValid = true;
					};
				}
				callback(Vfield, arErrors);
			}
			if( Vfield.$el.prop("disabled") ) {
  				if(action) validator.callEvent("clearField", Vfield.$el);
				delete  Vfield.isValid;
				onComplete ();
				return;
  			}
			if(!arRulesLength) {onComplete(); return true;}
  			Vfield.arRules.forEach(function(rule) {
  				var fnRule = validator.getRule(rule);
	  			if(!fnRule || !$.isFunction(fnRule)) {
	  				console.log("citrusValidator: Нет правила '"+rule+ "'");

	  				if(!(--arRulesLength)) onComplete();
	  				return true;
	  			}

	  			fnRule.call( validator, Vfield, function(Vfield, errors){
	  				if(!!errors) arErrors[arErrors.length] = errors;

	  				if(!(--arRulesLength)) onComplete();
	  			});
	  			return true;
	  		});
  		});
  	};
  	/**
  	* @action = если false не выводит никаких сообщений, только срабатывает callback(form)
  	*/
  	validator.validateForm = function( action, callback ){
  		var callback = callback || function(){};
  		var action = typeof action === "undefined" ? true : !!action;

  		//сбор полей для валидации
	    var countFields = validator.fields.length;
	    validator.isValid = true;
	    if( !countFields ) {callback(validator); if(action) validator.callEvent("afterFormValidate"); return true};

		validator.fields.forEach(function(Vfield) {
			if( Vfield.isValid !== undefined ) {
				if(!Vfield.isValid) validator.isValid = false;
				if(!(--countFields)) {
					callback(validator);
					if(action) validator.callEvent("afterFormValidate");
					if(action) validator.callEvent("scrollToFirstError");
				}
			} else {
				validator.validateField(Vfield, action, function(Vfield){
					if(!Vfield.isValid && Vfield.isValid !== undefined) validator.isValid = false;
					if(!(--countFields)) {
						callback(validator);
						if(action) validator.callEvent("afterFormValidate");
						if(action) validator.callEvent("scrollToFirstError");
					}
				});
			}
		});
  	}
  	validator.checkImportant = function(){
  		var important_fields = validator.filterField(function(field){return !!field.params["important"]});

		var importantIsvalid = true;
		if(important_fields.length > 0) {
			important_fields.forEach(function(Vfield) {
				if( Vfield.isValid !== undefined ) {
					if ( !Vfield.isValid ) importantIsvalid = false;
					return;
				} else {
					validator.validateField(Vfield, false, function(Vfield) {
						if ( !Vfield.isValid ) importantIsvalid = false;
					});
				}
			});
		}
		return importantIsvalid;
  	}

  	//возвращает массив validator.fields отсортированный по массиву $el
  	validator.getField = function($fields){
  		if(!$fields) return validator.fields;
  		return validator.fields.filter(function(item) {
		  return $(item.$el).is($fields);
		});
  	}
  	validator.filterField = function(fn){
  		if(!fn || !$.isFunction(fn)) throw new Error("citrusValidator: ошибка в аргументе функции filterField");
  		return validator.fields.filter(fn);
  	}

  	validator.addField = function($fields, arRules, params, messages){
  		if(!$fields || $.type($fields) !=="object" || !$fields.length ) throw new Error("citrusValidator: ошибка в аргументе $fields");

  		var arRules = arRules || [],
  			params = params || {},
  		    messages = messages || {};

  		$fields.each(function(index, field) {
  			var $el = $(this).prop("type") == "radio" ? $('[name="' + $(this).prop("name") + '"]') : $(this);

  			//проверка на наличие уже в массиве этих полей
  			var findedField = validator.getField($(field));
  			if(findedField.length) {
  				findedField = findedField[0];
  				//если поле уже в массиве полей то сливаем правила и параметры
  				findedField.arRules = $.unique( $.merge( findedField.arRules, arRules) );
  				findedField.params = $.extend( true, findedField.params, params );
  				findedField.messages = $.extend( true, findedField.messages, messages );
  				return;
  			}

  			//собираем массив полей
			validator.fields[validator.fields.length] = {
				$el: $el,
				arRules: arRules,
				params: params,
				messages: messages
			};

			//обрабатываются события change и keyup. По умолчанию change меняется на keyup после первой валидации. Можно установить через data-validate-trigger у каждого поля
			$el.on('change keyup', function(event) {
				var field = validator.getField($(this))[0] || false;
				if(!field) {console.error("Нет поля в массиве полей validator.fields");return;}
				var validateTrigger = field["params"]["trigger"] || "change";
				if( validateTrigger.indexOf(event.type) < 0  ) return;

				var Vfield = validator.getField($(this));

				validator.validateField(Vfield, true, function(Vfield){
					if(!!Vfield.params.important) {
						validator.callEvent(validator.checkImportant() ? "unlockForm":"lockForm");
					}
				});
			});
  		});
  		return $fields;
  	}
  	//init
  	;(function(){
  		validator.$form.find('[data-valid], [data-valid-params], [data-valid-messages]').each(function(index, el) {
  			var arRules = $(el).data("valid") ? $(el).data("valid").split(" ") : [];
  			var params = $(el).data("valid-params") || {};
  			var messages = $(el).data("valid-messages") || {};
  			if ( arRules || params)
  				validator.addField( $(el), arRules, params, messages );
  		});

		//обрабаываем сабмит
		validator.$form.on('click', validator.settings.submitBtn, function(event) {
			event.preventDefault();
			if(!$(this).attr("disabled")) {
				var vFieldsSubmit = validator.filterField(function(field){return field.params["trigger"] == "submit"});
				vFieldsSubmit.forEach(function(Vfield, i, arr){
					delete Vfield.isValid;
				});
				validator.validateForm();
			}
		});
		//обработка нажатий enter в форме
		if (validator.settings.submitBtn !== ":submit") {
			validator.$form.on('keypress' , function(event){
				if( event.keyCode == 13 && event.target.type !== "textarea") {
					event.preventDefault();
					validator.validateForm();
				}
			});
		};
		//проверка полей important
		if(!validator.checkImportant()) validator.callEvent("lockForm");
  	})();
}

citrusValidator.prototype = proto;
})( jQuery );