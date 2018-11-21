'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var StandardException = require('./StandardException');
var StandardException__default = _interopDefault(StandardException);

class ValidationFailed extends StandardException.UserError {
	constructor(aMessage=null,statusCode=null,inner=null,data=[]) {
		super(aMessage || ValidationFailed.MESSAGE,statusCode || ValidationFailed.STATUS,inner,data);
	}
}
ValidationFailed.MESSAGE = 'The requested operation was not successful due to validation errors.';
ValidationFailed.STATUS = 422;

exports.ValidationFailed = ValidationFailed;
