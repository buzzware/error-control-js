// import { StandardException, UserError, FrontEndError } from './StandardException';
import ErrorControlFiltersMixin from "./ErrorControlFiltersMixin";
import ErrorControlMakeMixin from "./ErrorControlMakeMixin";
import ErrorControlReportMixin from "./ErrorControlReportMixin";
import ErrorControlGuardMixin from "./ErrorControlGuardMixin";
import ErrorControlContainMixin from "./ErrorControlContainMixin";
import ErrorControlHandleMixin from "./ErrorControlHandleMixin";

// import HttpErrors from "./HttpErrors";
// import * as UserErrors from "./UserErrors";

export default class ErrorControl {

	constructor() {
		this.filters = [];
		this.factories = [];
		this.reporters = [];
		this.handlers = [];
	}

	static get default() {
		if (this._default)
			return this._default;
		this._default = new ErrorControl();
		return this._default;
	}

	isPromise(obj) {
		return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
	}

	manage(aError,aPostFunction=null) {
		let error = this.filter(aError,aPostFunction);
		if (!error)
			return error;
		this.report(error);
		this.handle(error);
		return error;
	}

	static filter(...args) {
		return this.default.filter(...args);
	}

	static make(...args) {
		return this.default.make(...args);
	}

	static guard(...args) {
		return this.default.guard(...args);
	}

	static guardAsync(...args) {
		return this.default.guardAsync(...args);
	}

	static contain(...args) {
		return this.default.contain(...args);
	}

	static report(...args) {
		return this.default.report(...args);
	}

	static handle(...args) {
		return this.default.handle(...args);
	}

	static manage(...args) {
		return this.default.manage(...args);
	}
}

Object.assign(ErrorControl.prototype, ErrorControlFiltersMixin);
Object.assign(ErrorControl.prototype, ErrorControlMakeMixin);
Object.assign(ErrorControl.prototype, ErrorControlReportMixin);
Object.assign(ErrorControl.prototype, ErrorControlGuardMixin);
Object.assign(ErrorControl.prototype, ErrorControlContainMixin);
Object.assign(ErrorControl.prototype, ErrorControlHandleMixin);

export { ErrorControl /*, StandardException, UserError, FrontEndError, UserErrors, HttpErrors*/ }

