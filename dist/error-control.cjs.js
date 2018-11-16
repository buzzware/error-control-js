'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// FROM https://github.com/gfmio/ts-error/blob/master/lib/helpers.js

var objectSetPrototypeOfIsDefined = typeof Object.setPrototypeOf === "function";
var objectGetPrototypeOfIsDefined = typeof Object.getPrototypeOf === "function";
var objectDefinePropertyIsDefined = typeof Object.defineProperty === "function";
var objectCreateIsDefined = typeof Object.create === "function";
var objectHasOwnPropertyIsDefined = typeof Object.prototype.hasOwnProperty === "function";

var setPrototypeOf = function setPrototypeOf(target, prototype) {
  if (objectSetPrototypeOfIsDefined) {
    Object.setPrototypeOf(target, prototype);
  } else {
    target.__proto__ = prototype;
  }
};
//exports.setPrototypeOf = setPrototypeOf;

var getPrototypeOf = function getPrototypeOf(target) {
  if (objectGetPrototypeOfIsDefined) {
    return Object.getPrototypeOf(target);
  } else {
    return target.__proto__ || target.prototype;
  }
};
//exports.getPrototypeOf = getPrototypeOf;

// Object.defineProperty exists in IE8, but the implementation is buggy, so we need to test if the call fails
// and, if so, set a flag to use the shim, as if the function were not defined. When this error is caught the first time,
// the function is called again recursively, after the flag is set, so the desired effect is achieved anyway.
var ie8ObjectDefinePropertyBug = false;
var defineProperty = function defineProperty(target, name, propertyDescriptor) {
  if (objectDefinePropertyIsDefined && !ie8ObjectDefinePropertyBug) {
    try {
      Object.defineProperty(target, name, propertyDescriptor);
    } catch (e) {
      ie8ObjectDefinePropertyBug = true;
      defineProperty(target, name, propertyDescriptor);
    }
  } else {
    target[name] = propertyDescriptor.value;
  }
};
//exports.defineProperty = defineProperty;

var hasOwnProperty = function hasOwnProperty(target, name) {
  if (objectHasOwnPropertyIsDefined) {
    return target.hasOwnProperty(target, name)
  } else {
    return target[name] === undefined;
  }
};
//exports.hasOwnProperty = hasOwnProperty;

var objectCreate = function objectCreate(prototype, propertyDescriptors) {
  if (objectCreateIsDefined) {
    return Object.create(prototype, propertyDescriptors);
  } else {
    var F = function F() {};
    F.prototype = prototype;
    var result = new F();
    if (typeof(propertyDescriptors) === "undefined") {
      return result;
    }
    if (propertyDescriptors === null) {
      throw new Error("PropertyDescriptors must not be null.");
    }
    if (typeof(propertyDescriptors) === "object") {
      for (var key in propertyDescriptors) {
        if (hasOwnProperty(propertyDescriptors, key)) {
          result[key] = propertyDescriptors[key].value;
        }
      }
    }

    return result;
  }
};
//exports.objectCreate = objectCreate;


// FROM https://github.com/gfmio/ts-error/blob/master/lib/cjs.js

// Small test for IE6-8, which checks if the environment prints errors "nicely"
// If not, a toString() method to be added to the error objects with formatting like in more modern browsers
var uglyErrorPrinting = (new Error()).toString() === "[object Error]";

// For compatibility
var extendableErrorName = "";

var ExtendableError = function(message) {
  // Get the constructor
  var originalConstructor = this.constructor;
  // Get the constructor name from the non-standard name property. If undefined (on old IEs), it uses the string representation
  // of the function to extract the name. This should work in all cases, except for directly instantiated ExtendableError objects,
  // for which the name of the ExtendableError class / function is used
  var constructorName = originalConstructor.name || (function() {
    var constructorNameMatch = originalConstructor.toString().match(/^function\s*([^\s(]+)/);
    return constructorNameMatch === null ? (extendableErrorName ? extendableErrorName : "Error") : constructorNameMatch[1];
  })();
  // If the constructor name is "Error", ...
  var constructorNameIsError = constructorName === "Error";
  // change it to the name of the ExtendableError class / function
  var name = constructorNameIsError ? extendableErrorName : constructorName;

  // Obtain a new Error instance. This also sets the message property already.
  var instance = Error.apply(this, arguments);

  // Set the prototype of this to the prototype of instance
  setPrototypeOf(instance, getPrototypeOf(this));

  // On old IEs, the instance will not extend our subclasses this way. The fix is to use this from the function call instead.
  if (!(instance instanceof originalConstructor) || !(instance instanceof ExtendableError)) {
    // originally var instance = this; which clashes with var instance above
    instance = this;  // should we use the same var, or declare a different name ?
    Error.apply(this, arguments);
    defineProperty(instance, "message", {
      configurable: true,
      enumerable: false,
      value: message,
      writable: true
    });
  }

  // define the name property
  defineProperty(instance, "name", {
    configurable: true,
    enumerable: false,
    value: name,
    writable: true
  });

  // Use Error.captureStackTrace on V8 to capture the proper stack trace excluding any of our error classes
  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, constructorNameIsError ? ExtendableError : originalConstructor);
  }
  // instance.stack can still be undefined, in which case the best solution is to create a new Error object and get it from there
  if (instance.stack === undefined) {
    var err = new Error(message);
    err.name = instance.name;
    instance.stack = err.stack;
  }

  // If the environment does not have a proper string representation (IE), provide an alternative toString()
  if (uglyErrorPrinting) {
    defineProperty(instance, "toString", {
      configurable: true,
      enumerable: false,
      value: function toString() {
        return (this.name || "Error") + (typeof this.message === "undefined" ? "" : ": " + this.message);
      },
      writable: true
    });
  }

  // We're done!
  return instance;
};

// Get the name of the ExtendableError function or use the string literal
extendableErrorName = ExtendableError.name || "ExtendableError";

// Set the prototype of ExtendableError to an Error object
ExtendableError.prototype = objectCreate(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true
  }
});


class StandardException extends ExtendableError {

  constructor(message=null,statusCode=null,inner=null,data=null) {
    super(message || StandardException.MESSAGE);
    this.name = this.constructor.name;
    this.human_name = this.name.split(/(?=[A-Z])/).join(' ');
    this.human_message = null;
    this.statusCode = statusCode || StandardException.STATUS_CODE;  // was status and STATUS
    this.inner = inner;
    this.data = data;
  }
}
StandardException.MESSAGE = 'An error occurred that could not be identified';
StandardException.STATUS_CODE = 500;

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

// pluggable exception filter framework
var ErrorControlFiltersMixin = {

	filter(aException) {
		let result = aException;
		for (let f of this.filters) {
			result = f(result);
		}
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
			result = f(aProperties);
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
			let keepLooping = r(aOptions);
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

	guard(aFunction,aPreFunction=null,aPostFunction=null) {
		try {
			return aFunction();
		} catch(e) {
			let filtered_e = e;
			if (filtered_e && aPreFunction)
				filtered_e = aPreFunction(filtered_e);
			if (filtered_e)
				filtered_e = this.filter(filtered_e);
			if (filtered_e && aPostFunction)
				filtered_e = aPostFunction(filtered_e);
			if (filtered_e)
				throw filtered_e;
		}
	},

	async guardAsync(aAsyncFunction,aPreFunction=null,aPostFunction=null) {
		try {
			return await aAsyncFunction();
		} catch(e) {
			let filtered_e = e;
			if (filtered_e && aPreFunction)
				filtered_e = aPreFunction(filtered_e);
			if (filtered_e)
				filtered_e = this.filter(filtered_e);
			if (filtered_e && aPostFunction)
				filtered_e = aPostFunction(filtered_e);
			if (filtered_e)
				throw filtered_e;
		}
	}

};

Object.assign(ErrorControl.prototype, ErrorControlFiltersMixin);
Object.assign(ErrorControl.prototype, ErrorControlMakeMixin);
Object.assign(ErrorControl.prototype, ErrorControlReportMixin);
Object.assign(ErrorControl.prototype, ErrorControlGuardMixin);

exports.StandardException = StandardException;
exports.ErrorControl = ErrorControl;
