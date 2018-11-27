import StandardException from './StandardException';

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
  100: ['Continue'],
  101: ['Switching Protocols'],
  102: ['Processing'],                 // RFC 2518, obsoleted by RFC 4918
  103: ['Early Hints'],
  200: ['OK'],
  201: ['Created'],
  202: ['Accepted'],
  203: ['Non-Authoritative Information'],
  204: ['No Content'],
  205: ['Reset Content'],
  206: ['Partial Content'],
  207: ['Multi-Status'],               // RFC 4918
  208: ['Already Reported'],
  226: ['IM Used'],
  300: ['Multiple Choices'],           // RFC 7231
  301: ['Moved Permanently'],
  302: ['Found'],
  303: ['See Other'],
  304: ['Not Modified'],
  305: ['Use Proxy'],
  307: ['Temporary Redirect'],
  308: ['Permanent Redirect'],         // RFC 7238
  400: ['Bad Request','The request was rejected, probably due to a syntax error.'],
  401: ['Unauthorized','The request was rejected because it lacked acceptable authentication credentials.'],
  402: ['Payment Required'],
  403: ['Forbidden','The request was not allowed.'],
  404: ['Not Found','The requested resource was not found on the server.'],
  405: ['Method Not Allowed'],
  406: ['Not Acceptable'],
  407: ['Proxy Authentication Required'],
  408: ['Request Timeout'],
  409: ['Conflict'],
  410: ['Gone','The requested resource is no longer available.'],
  411: ['Length Required'],
  412: ['Precondition Failed'],
  413: ['Payload Too Large'],
  414: ['URI Too Long'],
  415: ['Unsupported Media Type'],
  416: ['Range Not Satisfiable'],
  417: ['Expectation Failed'],
  418: ['I\'m a Teapot'],              // RFC 7168
  421: ['Misdirected Request'],
  422: ['Unprocessable Entity','The request data was not acceptable for processing.'],       // RFC 4918
  423: ['Locked'],                     // RFC 4918
  424: ['Failed Dependency'],          // RFC 4918
  425: ['Unordered Collection'],       // RFC 4918
  426: ['Upgrade Required'],           // RFC 2817
  428: ['Precondition Required'],      // RFC 6585
  429: ['Too Many Requests'],          // RFC 6585
  431: ['Request Header Fields Too Large'], // RFC 6585
  451: ['Unavailable For Legal Reasons'],
  500: ['Internal Server Error','The server encountered an unexpected condition that prevented it from fulfilling the request.'],
  501: ['Not Implemented','The server has not yet implemented that function.'],
  502: ['Bad Gateway','There was a problem reaching the server.'],
  503: ['Service Unavailable','The server is not currently available.'],
  504: ['Gateway Timeout','The server did not respond in time.'],
  505: ['HTTP Version Not Supported'],
  506: ['Variant Also Negotiates'],    // RFC 2295
  507: ['Insufficient Storage'],       // RFC 4918
  508: ['Loop Detected'],
  509: ['Bandwidth Limit Exceeded'],
  510: ['Not Extended'],               // RFC 2774
  511: ['Network Authentication Required'] // RFC 6585
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


function generateErrorClass(desc, code, message) {

	var name = errNameFromDesc(desc);

	var errorClass = class extends StandardException {
    constructor(message=null,statusCode=null,inner=null) {
      super(message || errorClass.MESSAGE,statusCode || errorClass.STATUS_CODE,inner);
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

	errorClass.MESSAGE = message;
  errorClass.STATUS_CODE = code;
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
	errorClass.prototype.statusCode = code;

	/**
	 * default code is the error name
	 * @type {String}
	 */
	errorClass.prototype.code = name.replace(new RegExp('Error$'), '');

	return errorClass;
}


HttpErrors.register(StandardException);

let errors = {};

for (let e in HttpErrors.STATUS_CODES) {
	let err = HttpErrors.STATUS_CODES[e];

	var code = parseInt(e, 10);
	if (code < 400)
		continue;

	let ec = generateErrorClass(err[0],code,err[1] || err[0]);
	errors[ec.name] = ec;
}
if (typeof(__webpack_exports__)=='object')
	Object.assign(__webpack_exports__,errors);
else
	Object.assign(HttpErrors,errors);

console.log('end');

export default HttpErrors;
