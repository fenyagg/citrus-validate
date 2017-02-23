# События.

События представляют собой функции для взаимодействия с визуальной частью. 

### Предустановленные события.

* **addFieldError\($field, arErrors\)** - добавляет ошибку к полю и класс "has-error
* **removeFieldError\($field\)** - удаляет ошибку к полю и добавляет класс "has-success"
* **clearField\($field\) **- удаляет все классы и сообщения об ошибках и правильной валидации
* **lockField\($field\) **- блокирует заполнение поля и вешает loading \(для аякс запросов\)
* **unlockField\($field\) **- разблокирует поле
* **lockForm\($form\) **- блокирует submit
* **unlockForm\($form\)** - разблокирует submit
* **afterFormValidate\($form\) **- запускает submit формы если form.isValid
* **reset\(\) **- обнуляет все закешированные валидации и сбрасывает введенные данные полей

### Работа с событиями.

**setEvent\( events, fn \) **- устанавливает событие

* **events\( string \|\| { string: fn, string: fn } \)** - название события или объект \(название: функция\)
* **fn** - функция

**getEvent\( \[eventName\] \) **- получает событие. Если не передано то получает все события.

**callEvent\( eventName, arg1, arg2 \) **- вызывает событие в контексте объекта формы \(можно передать дополнительно 2 параметра\)

> Все события могут быть получены и установлены в глобальной области \(для всех форм на странице\) или в локальной \(для конкретного объекта формы\).
>
> ```
> //Установка события глобально
> citrusValidator.prototype._setRule(addFieldError, function($field, arErrors){
>     $field
>         .addCLass('has-error').removeClass('has-success')
>         .find('.error').html('<p>'+arErrors.join('<br>')+'</p>');
> }); 
>
> //Установка события локально
> var form = new citrusValidator($('#form'));
> form.setRule(addFieldError, function($field, arErrors){
>     $field
>         .addCLass('has-error').removeClass('has-success')
>         .find('.error').html('<p>'+arErrors.join('<br>')+'</p>');
> }); 
> ```

### 





