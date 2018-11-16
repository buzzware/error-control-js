'use strict';

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

// This is taken from TypeScript compiler output, because it works quite reliably.
// There are various other methods though, so use whatever you like, if you have to use ES5.
// var __extends = (this && this.__extends) || (function () {
//     var extendStatics = Object.setPrototypeOf ||
//         ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
//         function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
//     return function (d, b) {
//         extendStatics(d, b);
//         function __() { this.constructor = d; }
//         d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
//     };
// })();


class HttpErrors {

  static register(aExceptionClass,aForCode=false) {
    if (this.allExceptions.indexOf(aExceptionClass)>=0)
      return;
    this.allExceptions.push(aExceptionClass);
    if (aForCode)
      this.exceptionsForCodes[aExceptionClass.STATUS_CODE] = aExceptionClass;
  }

  static classForStatusCode(aStatusCode) {
    var result = this.exceptionsForCodes[aStatusCode];
    if (!result)
      result = StandardException;
    return result;
  }

}
HttpErrors.allExceptions = [];
HttpErrors.exceptionsForCodes = {};

// from https://github.com/nodejs/node/blob/f3b49cfa7b3c2887ca8147b3d47ce1834b3923bf/lib/_http_server.js


HttpErrors.STATUS_CODES = {
  100: 'Continue',
  101: 'Switching Protocols',
  102: 'Processing',                 // RFC 2518, obsoleted by RFC 4918
  103: 'Early Hints',
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-Authoritative Information',
  204: 'No Content',
  205: 'Reset Content',
  206: 'Partial Content',
  207: 'Multi-Status',               // RFC 4918
  208: 'Already Reported',
  226: 'IM Used',
  300: 'Multiple Choices',           // RFC 7231
  301: 'Moved Permanently',
  302: 'Found',
  303: 'See Other',
  304: 'Not Modified',
  305: 'Use Proxy',
  307: 'Temporary Redirect',
  308: 'Permanent Redirect',         // RFC 7238
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: 'I\'m a Teapot',              // RFC 7168
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',       // RFC 4918
  423: 'Locked',                     // RFC 4918
  424: 'Failed Dependency',          // RFC 4918
  425: 'Unordered Collection',       // RFC 4918
  426: 'Upgrade Required',           // RFC 2817
  428: 'Precondition Required',      // RFC 6585
  429: 'Too Many Requests',          // RFC 6585
  431: 'Request Header Fields Too Large', // RFC 6585
  451: 'Unavailable For Legal Reasons',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',    // RFC 2295
  507: 'Insufficient Storage',       // RFC 4918
  508: 'Loop Detected',
  509: 'Bandwidth Limit Exceeded',
  510: 'Not Extended',               // RFC 2774
  511: 'Network Authentication Required' // RFC 6585
};

function errNameFromDesc(desc) {

    var pieces = desc.split(/\s+/);
    var name = '';
    for (let p of pieces) {
			// lowercase all, then capitalize it.
			var normalizedPiece = p.toLowerCase();
			normalizedPiece = normalizedPiece.charAt(0).toUpperCase() + normalizedPiece.substr(1);
			name += normalizedPiece;
		}

    // strip all non word characters
    name = name.replace(/\W+/g, '');

    // append 'Error' at the end of it only if it doesn't already end with it.
    if (!name.endsWith('Error'))
        name += 'Error';

    return name;
}


function generateErrorClass(acc, desc, code) {

	var parsedCode = parseInt(code, 10);

	if (parsedCode < 400)
		return acc;


	var name = errNameFromDesc(desc);

	var errorClass = class extends StandardException {
    constructor(message=null,statusCode=null,inner=null) {
      super(message || prototype.MESSAGE,statusCode || prototype.STATUS_CODE,inner);
    }
	};

	// var errorClass = /** @class */ (function (_super) {
	// 		__extends(_errorClass, _super);
	// 		function _errorClass() {
	// 				return _super !== null && _super.apply(this, arguments) || this;
	// 		}
	// 		return _errorClass;
	// }(StandardException));
	//

	Object.defineProperty(errorClass, "name", { value: name });

	errorClass.MESSAGE = 'The request was not processed due to a syntax error.';
  errorClass.STATUS_CODE = parsedCode;
  HttpErrors.register(errorClass,true);

	// this is a dynamic constructor for an error message.
	// arguments are variadic. constructor fn name must be anonymous.
	/**
	 * Variadic signature, first two are special to Restify, using a
	 * options obj.
	 * 1) new [Dynamic]Error(anotherErr, {...});
	 * 2) new [Dynamic]Error({...});
	 * Last one is a straight pass through to WError
	 * 3) new [Dynamic]Error('my special error message');
	 * @public
	 * @class
	 */
	// acc[name] = function () {
	// 	// call super
	// 	HttpError.apply(this, arguments);
	// };
	// util.inherits(acc[name], HttpError);

	/**
	 * assign non-standard display name property on the CONSTRUCTOR (not
	 * prototype), which is supported by all VMs. useful for stack trace
	 * output.
	 * @type {String}
	 */
	errorClass.displayName = name;

	/**
	 * the name of the error, used in the stack trace output
	 * @type {String}
	 */
	errorClass.prototype.name = name;

	/**
	 * assign a default status code based on core http module.
	 * users can override this if they want to. HttpError constructor
	 * will handle overriding at the instance level.
	 * @type {Number}
	 */
	errorClass.prototype.statusCode = parsedCode;

	/**
	 * default code is the error name
	 * @type {String}
	 */
	errorClass.prototype.code = name.replace(new RegExp('Error$'), '');

	acc[name] = errorClass;

	return acc;
}


HttpErrors.register(StandardException);

for (let e in HttpErrors.STATUS_CODES) {
	generateErrorClass(HttpErrors,HttpErrors.STATUS_CODES[e],e);
}

module.exports = HttpErrors;
