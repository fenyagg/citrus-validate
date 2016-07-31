/*
 * CitrusValidator jQuery Plugin
 * https://github.com/fenyagg/citrus-validate
 */


/* ===== Вспомогательные функции для конирования объектов и функций.
Function.prototype.clone = function() {
    var fct = this;
    var clone = function() {
        return fct.apply(this, arguments);
    };
    clone.prototype = fct.prototype;
    for (property in fct) {
        if (fct.hasOwnProperty(property) && property !== 'prototype') {
            clone[property] = fct[property];
        }
    }
    return clone;
};
>>>>>>> origin/master:jquery.citrusValidator.js
function clone(obj){
    if(obj == null || typeof(obj) != 'object') return obj;
    var temp = new obj.constructor();
    for(var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}*/

;(function( $ ){
	"use strict";

	//ie9 fix
	if (!Object.create) {
	  Object.create = function(proto) {
	    function F() {}
	    F.prototype = proto;
	    return new F;
	  };
	}