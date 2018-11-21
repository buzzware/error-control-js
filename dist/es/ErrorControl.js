import { StandardException, UserError, FrontEndError } from './StandardException';
export { StandardException, UserError, FrontEndError } from './StandardException';

// pluggable exception filter framework
var ErrorControlFiltersMixin = {

	filter(aException,aPostFunction=null) {
		let result = aException;
		for (let f of this.filters) {
			result = f.filter(result);
		}
		if (result && aPostFunction)
			result = aPostFunction(result);
		return result;
	},

	appendFilter(aFilter) {
		if (this.filters.includes(aFilter))
			return;
		this.filters.push(aFilter);
	},

	prependFilter(aFilter) {
		if (this.filters.includes(aFilter))
			return;
		this.filters.unshift(aFilter);
	}

};

var ErrorControlMakeMixin = {

	// pluggable exception factory - for creating exceptions of a given base class with the given message, code etc

	// use it like :
	// throw ErrorControl.make({message: 'something'});

	make(aProperties) {
		let result = null;
		for (let f of this.factories) {
			result = f.make(aProperties);
			if (result)
				break;
		}
		return result;
	},

	appendFactory(aFactory) {
		if (this.factories.includes(aFactory))
			return;
		this.factories.push(aFactory);
	},

	prependFactory(aFactory) {
		if (this.factories.includes(aFactory))
			return;
		this.factories.unshift(aFactory);
	}

};

var ErrorControlReportMixin = {

	// pluggable reporting

	report(aOptions) {
		for (let r of this.reporters) {
			let keepLooping = r.report(aOptions);
			if (keepLooping===false)
				break;
		}
	},

	appendReporter(aReporter) {
		if (this.reporters.includes(aReporter))
			return;
		this.reporters.push(aReporter);
	},

	prependReporter(aReporter) {
		if (this.reporters.includes(aReporter))
			return;
		this.reporters.unshift(aReporter);
	}

};

var ErrorControlGuardMixin = {

	/*
	 use this like :

	 ErrorControl.guard(
		 ()=>{
				// do stuff that may throw an exception
		 },
		 (e)=> e instanceof SwallowableError ? null : e
	 )
	*/

	guard(aFunction,aPostFunction=null) {
		try {
			return aFunction();
		} catch(e) {
			let filtered_e = e;
			if (filtered_e)
				filtered_e = this.filter(filtered_e,aPostFunction);
			if (filtered_e)
				throw filtered_e;
		}
	},

	async guardAsync(aAsyncFunction,aPostFunction=null) {
		try {
			return await aAsyncFunction();
		} catch(e) {
			let filtered_e = e;
			if (filtered_e)
				filtered_e = this.filter(filtered_e,aPostFunction);
			if (filtered_e)
				throw filtered_e;
		}
	}

};

class ErrorControl {

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

export default ErrorControl;
export { ErrorControl };
