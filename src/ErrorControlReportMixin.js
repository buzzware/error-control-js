export default {

	// pluggable reporting

	report(aOptions) {
		let result = null;
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
