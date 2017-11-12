
/*=========================
  Default events
  ===========================*/

var obEvents = {
	addFieldError: function($field, arErrors){
		var $input_container = $field.closest(this.settings.input_container);

		$input_container.addClass('_has-error')
						.removeClass('_has-success');

		$field.addClass('_has-error')
				.removeClass('_has-success');

		var messagesList = arErrors.join('<br>');

		var $error_block = $input_container.find(".valid-error");
		if (!$error_block.length) {
			$error_block = $('<div class="valid-error"></div>');
			$input_container.append($error_block);
		}

		$error_block.html(messagesList).addClass('_has-error');
	},
    removeFieldError: function($field){
	    $field.closest(this.settings.input_container).removeClass('_has-error')
                                                    .addClass('_has-success');

	    $field.addClass('_has-success')
		    .removeClass('_has-error');
    },
	addGroupError: function (groupId, VGroup) {
        if(!groupId) return;
        var v = this;

		VGroup.forEach(function(Vfield){
            var $input_container = Vfield.$el.closest(v.settings.input_container);

			Vfield.$el.addClass('_has-error')
					.removeClass('_has-success');

            $input_container
                .addClass('_has-group-error')
                .removeClass('_has-group-success');

			var messagesList = v.requireGroup[groupId]['error'];

            var $error_block = $input_container.find(".group-valid-error");
			if (!$error_block.length) {
				$error_block = $('<div class="group-valid-error"></div>');
				$input_container.append($error_block);
			}
			$error_block.html(messagesList).addClass('_has-error');
		});
    },
    removeGroupError: function (groupId, VGroup) {
        if(!groupId) return;
        var v = this;

        VGroup.forEach(function(Vfield){
            var $input_container = Vfield.$el.closest(v.settings.input_container);

            $input_container
                .addClass('has-group-success')
                .removeClass('has-group-error');
        });
    },
	clearField: function($field) {
		$field
			.removeClass('_has-success _has-error')
			.closest(this.settings.input_container).removeClass('_has-error _has-success');
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