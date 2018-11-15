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
