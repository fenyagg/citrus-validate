

$.fn.citrusValidator = function(params) {
	var $el = this;
	if (isset(params) && params === 'get') {
		return proto._getValidator($el);
	} else {
		var params = params || {};
		return $el.each(function(index, form ) {
			new citrusValidator($(form), params);
		});
	}
};
