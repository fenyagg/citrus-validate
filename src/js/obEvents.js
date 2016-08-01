
/*=========================
  Default events
  ===========================*/

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