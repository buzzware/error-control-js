// import ms from 'ms';
// import lunchtime from './lunchtime.js';
// import millisecondsUntil from './millisecondsUntil.js';
//
// export default function howLongUntilLunch(hours, minutes) {
// 	// lunch is at 12.30
// 	if (hours === undefined) hours = 12;
// 	if (minutes === undefined) minutes = 30;
//
// 	var millisecondsUntilLunchTime = millisecondsUntil(lunchtime(hours, minutes));
// 	return ms(millisecondsUntilLunchTime, { long: true });
// }



// ErrorControl
//
// ExtendableError - base class only
// filter() pluggable exception filter framework
// make()
// guard() executes block, returns result, passes exceptions through filter, throws non-null
//
// * methods above are instance methods, but ErrorControl has a default property with an instance, and matching static methods call the default instance methods
//

import StandardException from './StandardException';
import ErrorControl from './ErrorControl';
import ErrorControlFiltersMixin from "./ErrorControlFiltersMixin";
import ErrorControlMakeMixin from "./ErrorControlMakeMixin";
import ErrorControlReportMixin from "./ErrorControlReportMixin";
import ErrorControlGuardMixin from "./ErrorControlGuardMixin";

Object.assign(ErrorControl.prototype, ErrorControlFiltersMixin);
Object.assign(ErrorControl.prototype, ErrorControlMakeMixin);
Object.assign(ErrorControl.prototype, ErrorControlReportMixin);
Object.assign(ErrorControl.prototype, ErrorControlGuardMixin);

export {
	StandardException as StandardException,
	ErrorControl as ErrorControl
};
