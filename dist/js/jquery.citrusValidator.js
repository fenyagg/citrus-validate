/*
 * CitrusValidator jQuery Plugin
 * https://github.com/fenyagg/citrus-validate
 */

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

/*=========================
  Default messages
  ===========================*/

var obMessages = {
	required: "This Field is required.",
	email: "Please enter a valid email address.",
	url: "Please enter a valid URL.",
	date: "Please enter a valid date.",
	number: "Please enter a number.",
	confirm_password: "Passwords do not match.",
	maxlength: "Please enter no more than {0} characters.",
	minlength: "Please enter at least {0} characters.",
	rangelength: "Please enter a value between {0} to {1} characters.",
	range: "Please enter a number between {0} to {1}.",
	max: "Please enter a number less than or equal to {0}.",
	min: "Please enter a number greater than or equal to {0}.",
	phone_all: "Please enter a valid phone number.",
	phone: "Please enter a valid phone number.",
	inn: "Please enter a valid INN.",
	inn_u: "Please enter a valid INN of a legal entity.",
	inn_f: "Please enter a valid INN of a natural person.",
	ogrn: "Please enter a valid OGRN.",
	kpp: "Please enter a valid KPP.",
	filetype: "Invalid file type. Possible types: {0}.",
	group: "Please fill in the {0}.",
    list_separator: " or ",
	ruleGroup: "Wrong format"
};

/*=========================
  Default Rules
  ===========================*/

//отчищает строку от (), пробелов, -
function clearString(string){
	return string.replace(/\(|\)|\s+|-/g, "");
}
// Правила валидации
var obRules = {
	ruleGroup: function(Vfield, callback) {
        var v = this,
            isValid = false,
            arRulesLength;

		if( $.isArray(Vfield.params.ruleGroup) && Vfield.params.ruleGroup.length ) {
            arRulesLength = Vfield.params.ruleGroup.length;
            var onComplete = function () {
                var errors = isValid ? "" : v.getMessage.call(Vfield, "ruleGroup");
                callback(Vfield, errors);               
            };
			Vfield.params.ruleGroup.forEach(function (rule) {
				var fnRule = v.getRule(rule);
                if(!fnRule || !$.isFunction(fnRule)) {
                    console.error("citrusValidator: Нет правила '"+rule+ "'");
                    if(!(--arRulesLength)) onComplete();
                    return true;
                }
                fnRule.call( v, Vfield, function(Vfield, errors){
                    if(!errors) isValid = true;
                    if(!(--arRulesLength)) onComplete();
                });

			});
		}
	},
	"file" : function(Vfield, callback) {
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};

		var ifTypeValid = true;
		for (var i = 0; i < field.get(0).files.length; i++) {
			var file = field[0].files[i];
			if ('name' in file) {
				var ext = file.name.split(".");
				ext = ext[ext.length-1].toLocaleLowerCase();
				if( !(Vfield.params.filetype.indexOf(ext)+1) ) ifTypeValid = false;
			}
		}

		var errors = ifTypeValid ? "" : this.getMessage.call(Vfield,"filetype", [Vfield.params.filetype]);
		callback(Vfield, errors);
	},
	"required" : function(Vfield, callback) {
		var fieldNode = Vfield.$el.get(0);
		var isValid = fieldNode.type === 'radio' || fieldNode.type === 'checkbox' ? this.$form.find('[name="' + fieldNode.name + '"]:checked').length : $.trim(fieldNode.value) !== '';
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
        var validator = this;
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};

        validator.callEvent("lockField", field);

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
				console.error("citrusValidator: ajax validate error");
				callback(Vfield);
			})
            .always(function() {
                validator.callEvent("unlockField", field);
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
		var target = this.filterField(function(field){return $.inArray( "main_password", field.arRules)+1})[0];
		var isValid = (field.val() === target.$el.val());
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
};

/*=========================
  Default events
  ===========================*/

var obEvents = {
	addFieldError: function($field, arErrors){
		var $input_container = $field.parents(this.settings.input_container);
		$input_container
            .addClass('has-error')
			.removeClass('has-success');

		var messagesList = arErrors.join('<br>');
		var $error_block = $input_container.find(".error.help-block");
		if($error_block.length > 0) {
			$error_block.html(messagesList);
		} else {
			$input_container.append('<div class="error help-block">'+messagesList+'</div>');
		}
	},
    removeFieldError: function($field){
        $field.parents(this.settings.input_container).removeClass('has-error')
            .addClass('has-success');
    },
	addGroupError: function (groupId, VGroup) {
        if(!groupId) return;
        var v = this;

		VGroup.forEach(function(Vfield){
            var $input_container = Vfield.$el.parents(v.settings.input_container);

            $input_container
                .addClass('has-group-error')
                .removeClass('has-group-success');

            var $error_block = $input_container.find(".group-error.help-block");
            var messagesList = v.requireGroup[groupId]['error'];
            if($error_block.length > 0) {
                $error_block.html(messagesList);
            } else {
                $input_container.append('<div class="group-error help-block">'+messagesList+'</div>');
            }
		});
    },
    removeGroupError: function (groupId, VGroup) {
        if(!groupId) return;
        var v = this;

        VGroup.forEach(function(Vfield){
            var $input_container = Vfield.$el.parents(v.settings.input_container);

            $input_container
                .addClass('has-group-success')
                .removeClass('has-group-error');
        });
    },
	clearField: function($field) {
		$field.parents(this.settings.input_container)
            .removeClass('has-error')
            .removeClass('has-success');
	},
	lockField: function($field) {
		this.callEvent("removeFieldError", $field);
		$field.attr("readonly", "readonly")
 		 	  .closest(this.settings.input_container).addClass('ajax-loading');
	},
	unlockField: function($field){
		$field.removeAttr("readonly")
		 	  .closest(this.settings.input_container).removeClass('ajax-loading');
	},
	lockForm: function(){
		var v = this;
		v.isLocked = true;
		v.$form.find(v.settings.submitBtn).attr("disabled", "disabled");
  	},
  	unlockForm: function(){
  		var v = this;
  		v.isLocked = false;
  		v.$form.find(v.settings.submitBtn).removeAttr("disabled");
  	},
  	afterFormValidate: function(){
  		if(this.isValid) this.$form.submit();
  	},
  	scrollToFirstError: function(){
        var v = this;
  		var errorFileds = this.filterField( function(Vfield){
            return Vfield.isValid === false || ( Vfield.params.requireGroup && v.requireGroup[Vfield.params.requireGroup]['isValid'] === false)
  		});
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
  	},
};

/*=========================
  citrusValidator prototype
  ===========================*/

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

/*=========================
  citrusValidator
  ===========================*/

window.citrusValidator = function (form, options) {
	if(!form || form.length != 1) throw new Error("citrusValidator: ошибка в аргументе form");

	var v 			= this,
		obRules 	= Object.create(v._getRule()),
		obMessages 	= Object.create(v._getMessage()),
		obEvents 	= Object.create(v._getEvent());

	v.settings = $.extend({
            'submitBtn': ':submit',
            'input_container': ".input-container"
	    }, options);
	v.$form = form;
	v.fields = [];
    v.requireGroup = {};
	v.isLocked = false;

  	v.getMessage = function(messageName, arParams){
  		var message = this.messages && this.messages[messageName] ? this.messages[messageName] :  obMessages[messageName] ? obMessages[messageName] : "";

		if(message.length > 0 && $.type(arParams) === "array" && arParams.length > 0) {
			arParams.forEach(function(param, i){
				message = message.replace("{"+i+"}", param);
			});
		}
		return message;
	};
	v.setMessage = function(messages, messageText){
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
	};
	v.getRule = function(ruleName){
		return !ruleName ? obRules: obRules[ruleName] || false;
	};
	v.setRule = function(rules, fn){
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
	};
	v.getEvent = function(eventName){
		if( !eventName ) return obEvents;
		return obEvents[eventName] || false;
	};
	v.setEvent = function(events, fn){
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
	};
	v.callEvent = function(eventName, arg1, arg2){
		if( !eventName ) return;
		this.getEvent(eventName).call(this, arg1, arg2);
		return this;
	};

	//Работа с массивом v.fields
  	v.getField = function($fields){
  		if(!$fields) return v.fields;
  		return v.fields.filter(function(item) {
		  return $(item.$el).is($fields);
		});
  	};
  	v.filterField = function(fn){
  		if(!fn || !$.isFunction(fn)) throw new Error("citrusValidator: ошибка в аргументе функции filterField");
  		return v.fields.filter(fn);
  	};

	//Vfield массив из функции getField
  	v.validateField = function(Vfield, action, callback){
  		var Vfields = $.isArray(Vfield) ? Vfield : Array(Vfield),
  			action = action === undefined ? true : action,
  			callback = callback || function(){};

        Vfields.forEach(function(Vfield){
  			var arRulesLength = Vfield.arRules.length,
  				arErrors = [];

			var onComplete = function () {
                Vfield.errors = arErrors;
				if(!Vfield.params.trigger && !Vfield.$el.is(":checkbox, :file, :radio, select") ) Vfield.params.trigger = "keyup";

				if (arErrors.length > 0 ) {
					if(action) v.callEvent("addFieldError", Vfield.$el, arErrors);
					Vfield.$el.trigger("validError", [Vfield]);
					Vfield.isValid = false;
				} else {
					if( !Vfield.$el.is(":checkbox, :radio") && !Vfield.$el.val() ) {
						if(action) v.callEvent("clearField", Vfield.$el);
						delete  Vfield.isValid;
					}else {
						if(action) v.callEvent("removeFieldError", Vfield.$el);
						Vfield.$el.trigger("validSucess", [Vfield]);
						Vfield.isValid = true;
					}
				}
				callback(Vfield, arErrors);
			};
			if( Vfield.$el.prop("disabled") ) {
  				if(action) v.callEvent("clearField", Vfield.$el);
				delete Vfield.isValid;
				onComplete ();
				return;
  			}
			if(!arRulesLength) {onComplete(); return true;}
  			Vfield.arRules.forEach(function(rule) {
  				var fnRule = v.getRule(rule);
	  			if(!fnRule || !$.isFunction(fnRule)) {
	  				console.error("citrusValidator: Нет правила '"+rule+ "'");

	  				if(!(--arRulesLength)) onComplete();
	  				return true;
	  			}

	  			fnRule.call( v, Vfield, function(Vfield, errors){
	  				if(!!errors) arErrors[arErrors.length] = errors;

	  				if(!(--arRulesLength)) onComplete();
	  			});
	  			return true;
	  		});
  		});
  	};
  	v.validateGroup = function (groupId, action, callback) {
        if(!groupId) return;
        var callback = callback || function () {};
        var action = typeof action === "undefined" ? true : !!action;

        var isGroupValid = false;
        var VGroup = v.filterField(function(Vfield){ return Vfield.params.requireGroup == groupId});
        var arGroupNames = [];
        VGroup.forEach(function(Vfield, i, arr) {
            var fieldName = Vfield.params.name || Vfield.$el.attr("name");
            if(fieldName) arGroupNames.push(fieldName);
            var copyVfield = {};
            copyVfield["$el"] = Vfield.$el;
            copyVfield.arRules = ["required"];
            copyVfield.params = [];

            v.validateField(copyVfield, false, function (field, arErrors) {
                if(!arErrors.length) isGroupValid = true;
            });
        });
        var msgSeparator = v.getMessage("list_separator");

        if (action) {
            //устанавливаем сообщение если нет
            if(!v.requireGroup[groupId]['error']) v.requireGroup[groupId]['error'] = [v.getMessage("group", [arGroupNames.join(msgSeparator)]) ];
            v.requireGroup[groupId]['isValid'] = isGroupValid;
            v.callEvent(isGroupValid ? "removeGroupError" : "addGroupError", groupId, VGroup);
        }
        callback( isGroupValid, VGroup);
    };
  	v.validateForm = function( action, callback ) {
  		var callback = callback || function(){};
  		var action = typeof action === "undefined" ? true : !!action;
        v.isValid = true;
        var onComplete = function () {
            callback(v);
            if(action) v.callEvent("afterFormValidate");
            if(action) v.callEvent("scrollToFirstError");
        };

        //Валидация групп
        var isGroupValid = true;
        var currentGroup;
        if(!$.isEmptyObject(v.requireGroup)) {
            for( var groupId in v.requireGroup ){
                currentGroup = v.requireGroup[groupId];
                if( currentGroup['isValid'] === false ) {isGroupValid = false; continue;}
                v.validateGroup(groupId, true, function (currentValid) {
                    if(currentValid === false) isGroupValid = false;
                });
            }
        }



  		//Валидация полей
	    var countFields = v.fields.length;
	    if( !countFields ) {onComplete(); return true;}

		v.fields.forEach(function(Vfield) {
			if( Vfield.isValid !== undefined && Vfield.params["trigger"] !== "submit" ) {
				if(!Vfield.isValid) v.isValid = false;
				if(!(--countFields))  onComplete();

			} else {
				v.validateField(Vfield, action, function(Vfield){
					if(!Vfield.isValid && Vfield.isValid !== undefined) v.isValid = false;
                    if(!(--countFields))  onComplete();
				});
			}
		});
  	};
  	v.checkImportant = function(){
  		var important_fields = v.filterField(function(field){return !!field.params["important"]});

		var importantIsvalid = true;
		if(important_fields.length > 0) {
			important_fields.forEach(function(Vfield) {
				if( Vfield.isValid !== undefined ) {
					if ( !Vfield.isValid ) importantIsvalid = false;
					return;
				} else {
					v.validateField(Vfield, false, function(Vfield) {
						if ( !Vfield.isValid ) importantIsvalid = false;
					});
				}
			});
		}
		return importantIsvalid;
  	};
  	v.addField = function($fields, arRules, params, messages){
  		if(!$fields || $.type($fields) !=="object" || !$fields.length ) {console.error("citrusValidator. v.addField(): $fields не найден"); return;}

  		var arRules = arRules || [],
  			params = params || {},
  		    messages = messages || {};

  		$fields.each(function(index, field) {
  			var $el = $(this).prop("type") == "radio" ? $('[name="' + $(this).prop("name") + '"]') : $(this);

  			//проверка на наличие уже в массиве этих полей
  			var findedField = v.getField($(field));
  			if(findedField.length) {
  				findedField = findedField[0];
  				//если поле уже в массиве полей то сливаем правила и параметры
  				findedField.arRules = $.unique( $.merge( findedField.arRules, arRules) );
  				findedField.params = $.extend( true, findedField.params, params );
  				findedField.messages = $.extend( true, findedField.messages, messages );
  				return;
  			}
            var Vfield = {
                $el: $el,
                arRules: arRules,
                params: params,
                messages: messages
            };
			v.fields[v.fields.length] = Vfield;

			//добавим группу в v.reqiureGroup
            if(Vfield.params.requireGroup && !v.requireGroup[Vfield.params.requireGroup])
                v.requireGroup[Vfield.params.requireGroup] = {"isValid": undefined, "error": ""};


			//обрабатываются события change и keyup. По умолчанию change меняется на keyup после первой валидации. Можно установить через data-validate-trigger у каждого поля
			$el.on('change keyup', function(event) {
                
				if( event.keyCode == 13 ) return;
				var Vfield = v.getField($(this))[0] || false;
				if(!Vfield) {console.error("Нет поля в массиве полей v.fields");return;}
				var validateTrigger = Vfield["params"]["trigger"] || "change";
				if( validateTrigger.indexOf(event.type) < 0  ) return;

                //validate filed requireGroup
                if(Vfield.params.requireGroup)
                    v.validateGroup(Vfield.params.requireGroup, true);

				v.validateField(Vfield, true, function(Vfield){
					if(!!Vfield.params.important) {
						v.callEvent(v.checkImportant() ? "unlockForm":"lockForm");
					}
				});
			});
			$el.on('validate', function () {
				var Vfield = v.getField($(this));
				v.validateField(Vfield, true, function(Vfield){
					if(!!Vfield.params.important) {
						v.callEvent(v.checkImportant() ? "unlockForm":"lockForm");
					}
				});
			});
  		});
  		return $fields;
  	};
  	//init
  	;(function(){
  		v.$form.find('[data-valid], [data-valid-params], [data-valid-messages]').each(function(index, el) {
  			var arRules = $(el).data("valid") ? $(el).data("valid").split(" ") : [];
  			var params = $(el).data("valid-params") || {};
  			var messages = $(el).data("valid-messages") || {};
			if ( arRules.length || !$.isEmptyObject(params) || !$.isEmptyObject(messages)) v.addField( $(el), arRules, params, messages );
  		});

		//обрабаываем сабмит
		v.$form.on('click', v.settings.submitBtn, function(event) {
			event.preventDefault();
			if(!$(this).attr("disabled")) v.validateForm();
		});
		//обработка нажатий enter в форме
		if (v.settings.submitBtn !== ":submit") {
			v.$form.on('keypress' , function(event){
				if( event.keyCode == 13 && event.target.type !== "textarea") {
					event.preventDefault();
					v.validateForm();
				}
			});
		};
		//проверка полей important
		if(!v.checkImportant()) v.callEvent("lockForm");
  	})();
}

citrusValidator.prototype = proto;
})( jQuery );