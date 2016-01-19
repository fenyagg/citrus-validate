$(function() {
	window.form1 = new citrusValidate($(".form-validate"));

});

function citrusValidate(form){
	$form = form;

	var rules = {
  		"required": function(field){
  			return !!field.val();
  		}
  	};

  	var errorMessages = {
  		"required": "Поле обязательно для заполнения"
  	}

  	this.formValidate = function(){
  		//сбор полей для валидации
	    var validFields = $form.find("[data-valid]");     
	    if( validFields.length == 0 ) return;

	    //перебираем поля для валидации
		validFields.each(function(index, el) {			
			var field = $(this);
			//делаем массив из названий правил валидации
			validArray = field.data("valid").split(" ");

			//перебираем все правила валидации
			validArray.forEach(function(rule_name, i, arr) {
				//если нет такого правила пишем ошибку
				if(!rules.hasOwnProperty(rule_name)) {
					console.error("citrusValidate: Нет правила для "+rule_name);
					return false;
				}				

				//если есть используем правило
				if(rules[rule_name](field)){
					field.addClass('invalid');
				}
			});
		});
  	}
}
