export default {

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
