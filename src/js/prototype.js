
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
//добавление сообщений для битрикса
if (typeof BX !== 'undefined' && !!BX.message("citrusValidator")) {
	proto._setMessage(BX.message("citrusValidator"));
}