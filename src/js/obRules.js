
/*=========================
  Default Rules
  ===========================*/

//отчищает строку от (), пробелов, -
function clearString(string){
	return string.replace(/\(|\)|\s+|-/g, "");
}

//доп функции для валидации с https://github.com/Kholenkov/js-data-validation/blob/master/data-validation.js
function validateBik(bik, error) {
	var result = false;
	if (typeof bik === 'number') {
		bik = bik.toString();
	} else if (typeof bik !== 'string') {
		bik = '';
	}
	if (!bik.length) {
		error.code = 1;
		error.message = 'БИК пуст';
	} else if (/[^0-9]/.test(bik)) {
		error.code = 2;
		error.message = 'БИК может состоять только из цифр';
	} else if (bik.length !== 9) {
		error.code = 3;
		error.message = 'БИК может состоять только из 9 цифр';
	} else {
		result = true;
	}
	return result;
}

function validateInn(inn, error) {
	var result = false;
	if (typeof inn === 'number') {
		inn = inn.toString();
	} else if (typeof inn !== 'string') {
		inn = '';
	}
	if (!inn.length) {
		error.code = 1;
		error.message = 'ИНН пуст';
	} else if (/[^0-9]/.test(inn)) {
		error.code = 2;
		error.message = 'ИНН может состоять только из цифр';
	} else if ([10, 12].indexOf(inn.length) === -1) {
		error.code = 3;
		error.message = 'ИНН может состоять только из 10 или 12 цифр';
	} else {
		var checkDigit = function (inn, coefficients) {
			var n = 0;
			for (var i in coefficients) {
				n += coefficients[i] * inn[i];
			}
			return parseInt(n % 11 % 10);
		};
		switch (inn.length) {
			case 10:
				var n10 = checkDigit(inn, [2, 4, 10, 3, 5, 9, 4, 6, 8]);
				if (n10 === parseInt(inn[9])) {
					result = true;
				}
				break;
			case 12:
				var n11 = checkDigit(inn, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
				var n12 = checkDigit(inn, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
				if ((n11 === parseInt(inn[10])) && (n12 === parseInt(inn[11]))) {
					result = true;
				}
				break;
		}
		if (!result) {
			error.code = 4;
			error.message = 'Неправильное контрольное число';
		}
	}
	return result;
}

function validateKpp(kpp, error) {
	var result = false;
	if (typeof kpp === 'number') {
		kpp = kpp.toString();
	} else if (typeof kpp !== 'string') {
		kpp = '';
	}
	if (!kpp.length) {
		error.code = 1;
		error.message = 'КПП пуст';
	} else if (kpp.length !== 9) {
		error.code = 2;
		error.message = 'КПП может состоять только из 9 знаков (цифр или заглавных букв латинского алфавита от A до Z)';
	} else if (!/^[0-9]{4}[0-9A-Z]{2}[0-9]{3}$/.test(kpp)) {
		error.code = 3;
		error.message = 'Неправильный формат КПП';
	} else {
		result = true;
	}
	return result;
}

function validateKs(ks, bik, error) {
	var result = false;
	if (validateBik(bik, error)) {
		if (typeof ks === 'number') {
			ks = ks.toString();
		} else if (typeof ks !== 'string') {
			ks = '';
		}
		if (!ks.length) {
			error.code = 1;
			error.message = 'К/С пуст';
		} else if (/[^0-9]/.test(ks)) {
			error.code = 2;
			error.message = 'К/С может состоять только из цифр';
		} else if (ks.length !== 20) {
			error.code = 3;
			error.message = 'К/С может состоять только из 20 цифр';
		} else {
			var bikKs = '0' + bik.toString().slice(4, 6) + ks;
			var checksum = 0;
			var coefficients = [7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1];
			for (var i in coefficients) {
				checksum += coefficients[i] * (bikKs[i] % 10);
			}
			if (checksum % 10 === 0) {
				result = true;
			} else {
				error.code = 4;
				error.message = 'Неправильное контрольное число';
			}
		}
	}
	return result;
}

function validateOgrn(ogrn, error) {
	var result = false;
	if (typeof ogrn === 'number') {
		ogrn = ogrn.toString();
	} else if (typeof ogrn !== 'string') {
		ogrn = '';
	}
	if (!ogrn.length) {
		error.code = 1;
		error.message = 'ОГРН пуст';
	} else if (/[^0-9]/.test(ogrn)) {
		error.code = 2;
		error.message = 'ОГРН может состоять только из цифр';
	} else if (ogrn.length !== 13) {
		error.code = 3;
		error.message = 'ОГРН может состоять только из 13 цифр';
	} else {
		var n13 = parseInt((parseInt(ogrn.slice(0, -1)) % 11).toString().slice(-1));
		if (n13 === parseInt(ogrn[12])) {
			result = true;
		} else {
			error.code = 4;
			error.message = 'Неправильное контрольное число';
		}
	}
	return result;
}

function validateOgrnip(ogrnip, error) {
	var result = false;
	if (typeof ogrnip === 'number') {
		ogrnip = ogrnip.toString();
	} else if (typeof ogrnip !== 'string') {
		ogrnip = '';
	}
	if (!ogrnip.length) {
		error.code = 1;
		error.message = 'ОГРНИП пуст';
	} else if (/[^0-9]/.test(ogrnip)) {
		error.code = 2;
		error.message = 'ОГРНИП может состоять только из цифр';
	} else if (ogrnip.length !== 15) {
		error.code = 3;
		error.message = 'ОГРНИП может состоять только из 15 цифр';
	} else {
		var n15 = parseInt((parseInt(ogrnip.slice(0, -1)) % 13).toString().slice(-1));
		if (n15 === parseInt(ogrnip[14])) {
			result = true;
		} else {
			error.code = 4;
			error.message = 'Неправильное контрольное число';
		}
	}
	return result;
}

function validateRs(rs, bik, error) {
	var result = false;
	if (validateBik(bik, error)) {
		if (typeof rs === 'number') {
			rs = rs.toString();
		} else if (typeof rs !== 'string') {
			rs = '';
		}
		if (!rs.length) {
			error.code = 1;
			error.message = 'Р/С пуст';
		} else if (/[^0-9]/.test(rs)) {
			error.code = 2;
			error.message = 'Р/С может состоять только из цифр';
		} else if (rs.length !== 20) {
			error.code = 3;
			error.message = 'Р/С может состоять только из 20 цифр';
		} else {
			var bikRs = bik.toString().slice(-3) + rs;
			var checksum = 0;
			var coefficients = [7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1];
			for (var i in coefficients) {
				checksum += coefficients[i] * (bikRs[i] % 10);
			}
			if (checksum % 10 === 0) {
				result = true;
			} else {
				error.code = 4;
				error.message = 'Неправильное контрольное число';
			}
		}
	}
	return result;
}

function validateSnils(snils, error) {
	var result = false;
	if (typeof snils === 'number') {
		snils = snils.toString();
	} else if (typeof snils !== 'string') {
		snils = '';
	}
	if (!snils.length) {
		error.code = 1;
		error.message = 'СНИЛС пуст';
	} else if (/[^0-9]/.test(snils)) {
		error.code = 2;
		error.message = 'СНИЛС может состоять только из цифр';
	} else if (snils.length !== 11) {
		error.code = 3;
		error.message = 'СНИЛС может состоять только из 11 цифр';
	} else {
		var sum = 0;
		for (var i = 0; i < 9; i++) {
			sum += parseInt(snils[i]) * (9 - i);
		}
		var checkDigit = 0;
		if (sum < 100) {
			checkDigit = sum;
		} else if (sum > 101) {
			checkDigit = parseInt(sum % 101);
			if (checkDigit === 100) {
				checkDigit = 0;
			}
		}
		if (checkDigit === parseInt(snils.slice(-2))) {
			result = true;
		} else {
			error.code = 4;
			error.message = 'Неправильное контрольное число';
		}
	}
	return result;
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
		if(!field.val()) {callback(Vfield); return true;}

		var ifTypeValid = true,
			summFilesSize = 0;

		for (var i = 0; i < field.get(0).files.length; i++) {
			var file = field[0].files[i];
			if ('name' in file) {
				var ext = file.name.split(".");
				ext = ext[ext.length-1].toLocaleLowerCase();
				if( !(Vfield.params.filetype.indexOf(ext)+1) ) ifTypeValid = false;

				summFilesSize +=file.size;
			}
		}

		var	ifSizeValid = true;
		if (Vfield.params.filesize) {
			var paramFileSize = Vfield.params.filesize;
			var maxFileSize = Vfield.params.filesize,
				arSizeCalc = {'мб': 1048576, 'mb': 1048576,'кб': 1024, 'kb': 1024};
			for (var sizeName in arSizeCalc) {
				if (typeof paramFileSize === 'string' && paramFileSize.indexOf(sizeName)+1) {
					paramFileSize = +paramFileSize.replace(sizeName,'') * arSizeCalc[sizeName];
				}
			}
			ifSizeValid = summFilesSize <= paramFileSize;
		}

		var errors = [];
		if (!ifTypeValid)
			errors.push(this.getMessage.call(Vfield,"filetype", [Vfield.params.filetype]));

		if(!ifSizeValid)
			errors.push(this.getMessage.call(Vfield,"filesize", [Vfield.params.filesize]));

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
	"login" : function (Vfield, callback) {
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;}
		var isValid = /[a-zA-Z1-9]+$/.test(field.val()); // && /^[a-zA-z]{1}.?$/.test(field.val())
		var errors = isValid ? "" : this.getMessage.call(Vfield,"login");
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
	"recaptcha" : function (Vfield, callback) {
		/*
		* Использование
		*< script src='//www.google.com/recaptcha/api.js?hl=ru'></script>
		* <div id="<?=$fieldInfo['ID']?>"></div>
		* <input type="hidden" name="<?=$fieldInfo['CODE']?>" data-valid='recaptcha'>
		*      <script>
			        if (typeof grecaptcha !== 'undefined') {
			            var $hiddenRecaptcha = $('[name="<?=$fieldInfo['CODE']?>"]');
				        var widgetId = grecaptcha.render('<?=$fieldInfo['ID']?>', {
					        'sitekey' : '<?=($arParams['GOOGLE_RECAPTCHA_PUBLIC_KEY'])?>',
					        'callback' : function(){ $hiddenRecaptcha.trigger('validate');},
				        });
				        $hiddenRecaptcha.data('widget-id', widgetId);
			        }
			    </script>
		* */

		if (typeof grecaptcha === 'undefined') {callback(Vfield); return;}

		var widjetId = Vfield.$el.data('widget-id');
		var isValid = grecaptcha.getResponse(widjetId);
		var errors = isValid ? "" : this.getMessage.call(Vfield,"recaptcha");
		callback(Vfield, errors);
	},
	// ИНН юр и физ лица
	"inn": function(Vfield, callback){
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;}
		var isValid = validateInn(field.val(), {});
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
		var isValid = validateOgrn(field.val(), {});
		var errors = isValid ? "" : this.getMessage.call(Vfield,"ogrn");
		callback(Vfield, errors);
	},
	"kpp": function(Vfield, callback){
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};
		var isValid = validateKpp(field.val(), {});
		var errors = isValid ? "" : this.getMessage.call(Vfield,"kpp");
		callback(Vfield, errors);
	},
	"bik": function(Vfield, callback){
		var field = Vfield.$el,
			v = this;
		if(!field.val()) {callback(Vfield); return true;}
		var isValid = validateBik(field.val(), {});

		var errors = isValid ? "" : this.getMessage.call(Vfield,"bik");
		callback(Vfield, errors);

		if (isValid) {
			//validate ks and rs
			var ksField = this.filterField(function (field) {
				return $.inArray('ks', field.arRules)+1;
			});
			$(ksField).each(function (index,item) {
				var ksFieldDouble = Object.create(item);
				ksFieldDouble.arRules = ['ks'];
				v.validateField(ksFieldDouble);
			});

			var rsField = this.filterField(function (field) {
				return $.inArray('rs', field.arRules)+1;
			});
			$(rsField).each(function (index,item) {
				var rsFieldDouble = Object.create(item);
				rsFieldDouble.arRules = ['rs'];
				v.validateField(rsFieldDouble);
			});
		}
	},
	"ogrnip": function(Vfield, callback){
		var field = Vfield.$el;
		if(!field.val()) {callback(Vfield); return true;};
		var isValid = validateOgrnip(field.val(), {});
		var errors = isValid ? "" : this.getMessage.call(Vfield,"ogrnip");
		callback(Vfield, errors);
	},
	"ks": function(Vfield, callback){
		var field = Vfield.$el,
			val = field.val(),
			bikField, bik, errors,
			isBikValid = true;
		if(!field.val()) {callback(Vfield); return true;}

		var isValid = /\d/.test(val) && val.length === 20;
		bikField = this.filterField(function (field) {
			return $.inArray('bik', field.arRules)+1;
		});
		if (bikField.length) {
			bikField = bikField[0];
			bik = bikField.$el.val();
			if (isValid && bik && bikField.isValid) isBikValid = validateKs(val, bik, {});
		}

		errors = isValid ? "" : this.getMessage.call(Vfield,"ks");
		if (!isBikValid) errors = this.getMessage.call(Vfield,"ks") +' '+ this.getMessage.call(Vfield,"bikBased",[bik]);
		callback(Vfield, errors);
	},
	"rs": function(Vfield, callback){
		var field = Vfield.$el,
			val = field.val(),
			bikField, bik, errors,
			isBikValid = true;
		if(!field.val()) {callback(Vfield); return true;}

		var isValid = /\d/.test(val) && val.length === 20;
		bikField = this.filterField(function (field) {
			return $.inArray('bik', field.arRules)+1;
		});
		if (bikField.length) {
			bikField = bikField[0];
			bik = bikField.$el.val();
			if (isValid && bik && bikField.isValid) isBikValid = validateRs(val, bik, {});
		}

		errors = isValid ? "" : this.getMessage.call(Vfield,"rs");
		if (!isBikValid) errors = this.getMessage.call(Vfield,"rs") +' '+ this.getMessage.call(Vfield,"bikBased",[bik]);
		callback(Vfield, errors);
	},
	"snils": function(Vfield, callback){
		var val = Vfield.$el.val();
		val = clearString(val);
		if(!val) {callback(Vfield); return true;}
		var isValid = validateSnils(val, {});
		var errors = isValid ? "" : this.getMessage.call(Vfield,"snils");
		callback(Vfield, errors);
	},
};