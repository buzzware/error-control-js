// pluggable exception filter framework
export default {

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
