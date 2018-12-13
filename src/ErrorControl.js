import { StandardException, UserError, FrontEndError } from './StandardException';
import ErrorControlFiltersMixin from "./ErrorControlFiltersMixin";
import ErrorControlMakeMixin from "./ErrorControlMakeMixin";
import ErrorControlReportMixin from "./ErrorControlReportMixin";
import ErrorControlGuardMixin from "./ErrorControlGuardMixin";

import HttpErrors from "./HttpErrors";
import UserErrors from "./UserErrors";

export default class ErrorControl {

	constructor() {
		this.filters = [];
		this.factories = [];
		this.reporters = [];
	}

	static get default() {
		if (this._default)
			return this._default;
		this._default = new ErrorControl();
		return this._default;
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

	static report(...args) {
		return this.default.report(...args);
	}
}

Object.assign(ErrorControl.prototype, ErrorControlFiltersMixin);
Object.assign(ErrorControl.prototype, ErrorControlMakeMixin);
Object.assign(ErrorControl.prototype, ErrorControlReportMixin);
Object.assign(ErrorControl.prototype, ErrorControlGuardMixin);

export { ErrorControl, StandardException, UserError, FrontEndError, UserErrors, HttpErrors }

