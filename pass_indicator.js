//позаимствуем с яндекса
/*<div class="password-indicator"><div class="password-indicator__i" style="width: 0%; background: red;">&nbsp;</div></div>*/

//выводим сколько символов
i18n.tanker.dynamic.plural: function(){
	return function(t) {
            var e = isNaN(parseInt(t.count)) ? 0 : t.count
              , i = e % 10
              , s = e % 100;
            return 1 == i && 11 != s ? t.one : i > 1 && 5 > i && (10 > s || s > 20) ? t.some : t.many
        }(t)
}
updatePasswordLegends = function(t) {
	this.passwordLegends.html(", " + t + "&#160;" + i18n.tanker.dynamic.plural({
	    count: t,
	    one: "символ",
	    some: "символа",
	    many: "символов"
	}))
},

onPasswordUpdate: function() {
    var t = this.$ctrl.val().length;
    this.updateIndicator(t),
    this.updatePasswordLegends(t)
},
//устанавливаем ширину полоски
updateIndicator = function(t) {
    this.strengthIndicator.css({
        width: Math.min(Math.log((t || 0) + 1) / Math.log(255) * 100, 100) + "%"
    })
},
//устанавливаем цвет
onPasswordValidation: function(t, e, i) {
    e ? i ? (this.strengthIndicator.css({
        background: "orange"
    }),
    this.getErrorByCode("weak").css({
        color: "orange"
    }).removeClass("g-hidden"),
    this.passwordAcceptableMsg.addClass("g-hidden")) : (this.strengthIndicator.css({
        background: "green"
    }),
    this.passwordAcceptableMsg.removeClass("g-hidden")) : (this.strengthIndicator.css({
        background: "red"
    }),
    this.getErrorByCode("weak").css({
        color: "#BB0000"
    }),
    this.passwordAcceptableMsg.addClass("g-hidden"))
},
