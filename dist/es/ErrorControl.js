// pluggable exception filter framework
var ErrorControlFiltersMixin = {

	filter(aFunctionOrException,aPostFunction=null) {
		if (typeof(aFunctionOrException)=='function') {
			try {
				let result = aFunctionOrException();
				if (this.isPromise(result)) {
					return result.catch((e) => {
						let filtered_e = e;
						if (filtered_e)
							filtered_e = this.filter(filtered_e,aPostFunction);
						if (filtered_e)
							throw filtered_e;
					});
				} else {
					return result;
				}
			} catch(e) {
				let filtered_e = e;
				if (filtered_e)
					filtered_e = this.filter(filtered_e,aPostFunction);
				if (filtered_e)
					throw filtered_e;
			}
		} else {
			let result = aFunctionOrException;
			for (let f of this.filters) {
				result = f.filter(result);
			}
			if (result && aPostFunction)
				result = aPostFunction(result);
			return result;
		}
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

	DEPRECATED - use filter instead

	Guard filters and usually rethrows StandardErrors.

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

var ErrorControlContainMixin = {

	/*

	Contain forces any errors thrown into the manage method, and should never leak exceptions.

	 use this like :

	 ErrorControl.contain(
		 ()=>{	// async or not
				// do stuff that may throw an exception
		 },
		 (e)=> e instanceof SwallowableError ? null : e
	 )

	 Ember example :

		// exceptions in async actions get swallowed by Ember 3.4
		// contain ensures they get handled
		actions: {
        doSomething() {  // should never have async keyword - will be what contain returns
            return ErrorControl.contain(async () => {   // can be async or not
                throw new Error('Bang');
            });
        }
    }


	*/

	// handles normal and async functions
	contain(aFunction,aPostFunction=null) {
		try {
			let result = aFunction();
			if (this.isPromise(result)) {
				return result.catch((e) => {
					return this.manage(e, aPostFunction);
				});
			} else {
				return result;
			}
		} catch(e) {
			return this.manage(e, aPostFunction);
		}
	}

};

var ErrorControlHandleMixin = {

	// pluggable handling

	handle(aOptions) {
		for (let h of this.handlers) {
			let keepLooping = h.handle(aOptions);
			if (keepLooping===false)
				break;
		}
	},

	appendHandler(aHandler) {
		if (this.handlers.includes(aHandler))
			return;
		this.handlers.push(aHandler);
	},

	prependHandler(aHandler) {
		if (this.handlers.includes(aHandler))
			return;
		this.handlers.unshift(aHandler);
	}

};

// import { StandardException, UserError, FrontEndError } from './StandardException';

// import HttpErrors from "./HttpErrors";
// import * as UserErrors from "./UserErrors";

class ErrorControl {

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

export default ErrorControl;
export { ErrorControl };
