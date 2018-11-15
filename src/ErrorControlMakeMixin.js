export default {

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
