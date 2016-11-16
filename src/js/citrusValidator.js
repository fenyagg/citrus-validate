
/*=========================
  citrusValidator
  ===========================*/

window.citrusValidator = function (form, options) {
	if(!form || form.length != 1) throw new Error("citrusValidator: ошибка в аргументе form");

	var v 			= this,
		obRules 	= Object.create(v._getRule()),
		obMessages 	= Object.create(v._getMessage()),
		obEvents 	= Object.create(v._getEvent());

	v.settings = $.extend( {
	      'submitBtn': ':submit'
	    }, options);

	v.$form = form;
	v.fields = Array();
	v.isLocked = false;

  	v.getMessage = function(messageName, arParams){
  		var message = this.messages && this.messages[messageName] ? this.messages[messageName] :  obMessages[messageName] ? obMessages[messageName] : "";

		if(message.length > 0 && $.type(arParams) === "array" && arParams.length > 0) {
			arParams.forEach(function(param, i){
				message = message.replace("{"+i+"}", param);
			});
		}
		return message;
	}
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
	}
	v.getRule = function(ruleName){
		return !ruleName ? obRules: obRules[ruleName] || false;
	}
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
	}
	v.getEvent = function(eventName){
		if( !eventName ) return obEvents;
		return obEvents[eventName] || false;
	}
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
	}
	v.callEvent = function(eventName, arg1, arg2){
		if( !eventName ) return;
		this.getEvent(eventName).call(this, arg1, arg2);
		return this;
	}

	//Работа с массивом v.fields
  	v.getField = function($fields){
  		if(!$fields) return v.fields;
  		return v.fields.filter(function(item) {
		  return $(item.$el).is($fields);
		});
  	}
  	v.filterField = function(fn){
  		if(!fn || !$.isFunction(fn)) throw new Error("citrusValidator: ошибка в аргументе функции filterField");
  		return v.fields.filter(fn);
  	}



	//Vfield массив из функции getField
  	v.validateField = function(Vfield, action, callback){
  		var Vfield = $.isArray(Vfield) ? Vfield : Array(Vfield),
  			action = action === undefined ? true : action,
  			callback = callback || function(){};

  		Vfield.forEach(function(Vfield){
  			if(Vfield.params.lockOnValid) v.callEvent("lockField", Vfield.$el);

  			var arRulesLength = Vfield.arRules.length,
  				arErrors = Array(),
  				isValid;

			function onComplete () {
				if(Vfield.params.lockOnValid) v.callEvent("unlockField", Vfield.$el);
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
					};
				}
				callback(Vfield, arErrors);
			}
			if( Vfield.$el.prop("disabled") ) {
  				if(action) v.callEvent("clearField", Vfield.$el);
				delete  Vfield.isValid;
				onComplete ();
				return;
  			}
			if(!arRulesLength) {onComplete(); return true;}
  			Vfield.arRules.forEach(function(rule) {
  				var fnRule = v.getRule(rule);
	  			if(!fnRule || !$.isFunction(fnRule)) {
	  				console.log("citrusValidator: Нет правила '"+rule+ "'");

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
  	v.validateForm = function( action, callback ){
  		var callback = callback || function(){};
  		var action = typeof action === "undefined" ? true : !!action;

  		//сбор полей для валидации
	    var countFields = v.fields.length;
	    v.isValid = true;
	    if( !countFields ) {callback(v); if(action) v.callEvent("afterFormValidate"); return true};

		v.fields.forEach(function(Vfield) {
			if( Vfield.isValid !== undefined && Vfield.params["trigger"] !== "submit" ) {
				if(!Vfield.isValid) v.isValid = false;
				if(!(--countFields)) {
					callback(v);
					if(action) v.callEvent("afterFormValidate");
					if(action) v.callEvent("scrollToFirstError");
				}
			} else {
				v.validateField(Vfield, action, function(Vfield){
					if(!Vfield.isValid && Vfield.isValid !== undefined) v.isValid = false;
					if(!(--countFields)) {
						callback(v);
						if(action) v.callEvent("afterFormValidate");
						if(action) v.callEvent("scrollToFirstError");
					}
				});
			}
		});
  	}
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
  	}

  	v.addField = function($fields, arRules, params, messages){
  		if(!$fields || $.type($fields) !=="object" || !$fields.length ) throw new Error("citrusValidator: ошибка в аргументе $fields");

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

  			//собираем массив полей
			v.fields[v.fields.length] = {
				$el: $el,
				arRules: arRules,
				params: params,
				messages: messages
			};

			//обрабатываются события change и keyup. По умолчанию change меняется на keyup после первой валидации. Можно установить через data-validate-trigger у каждого поля
			$el.on('change keyup', function(event) {
				if( event.keyCode == 13 ) return;
				var field = v.getField($(this))[0] || false;
				if(!field) {console.error("Нет поля в массиве полей v.fields");return;}
				var validateTrigger = field["params"]["trigger"] || "change";
				if( validateTrigger.indexOf(event.type) < 0  ) return;

				var Vfield = v.getField($(this));

				v.validateField(Vfield, true, function(Vfield){
					if(!!Vfield.params.important) {
						v.callEvent(v.checkImportant() ? "unlockForm":"lockForm");
					}
				});
			});
  		});
  		return $fields;
  	}
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