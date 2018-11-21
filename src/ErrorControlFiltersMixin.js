// pluggable exception filter framework
export default {

	filter(aException) {
		let result = aException;
		for (let f of this.filters) {
			result = f.filter(result);
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
