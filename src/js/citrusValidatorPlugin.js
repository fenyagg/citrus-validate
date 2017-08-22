

$.fn.citrusValidator = function(params) {
	var $el = this;
	if (isset(params) && params === 'get') {
		return proto._getValidator($el);
	} else if(isset(params) && params === 'destroy'){
		$(proto._getValidator($el)).each(function (index, validator) {
			validator.destroy();
		});
	}else {
		var params = params || {};
		return $el.each(function(index, form ) {
			new citrusValidator($(form), params);
		});
	}
};
