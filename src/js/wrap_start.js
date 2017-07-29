/*
 * CitrusValidator jQuery Plugin
 * https://github.com/fenyagg/citrus-validate
 */

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
	var isset = function (v) {
		return typeof v !== 'undefined' && v !== null;
	};