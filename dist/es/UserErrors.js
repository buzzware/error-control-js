import { UserError } from './StandardException';

class ValidationFailed extends UserError {
	constructor(aMessage=null,statusCode=null,inner=null,data=[]) {
		super(aMessage || ValidationFailed.MESSAGE,statusCode || ValidationFailed.STATUS_CODE,inner,data);
	}
}
ValidationFailed.MESSAGE = 'The requested operation was not successful due to validation errors.';
ValidationFailed.STATUS_CODE = 422;

export { ValidationFailed };
