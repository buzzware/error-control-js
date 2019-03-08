export default {

	// pluggable handling

	handle(aOptions) {
		let result = null;
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
