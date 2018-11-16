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
