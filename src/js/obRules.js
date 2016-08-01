
/*=========================
  Default Rules
  ===========================*/

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
				if( !(Vfield.params.filetype.indexOf(ext)+1) ) ifTypeValid = false;
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
};