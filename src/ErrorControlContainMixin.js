export default {

	/*

	Contain forces any errors thrown into the manage method, and should never leak exceptions.

	 use this like :

	 ErrorControl.contain(
		 ()=>{	// async or not
				// do stuff that may throw an exception
		 },
		 (e)=> e instanceof SwallowableError ? null : e
	 )

	 Ember example :

		// exceptions in async actions get swallowed by Ember 3.4
		// contain ensures they get handled
		actions: {
        doSomething() {  // should never have async keyword - will be what contain returns
            return ErrorControl.contain(async () => {   // can be async or not
                throw new Error('Bang');
            });
        }
    }


	*/

	// handles normal and async functions
	contain(aFunction,aPostFunction=null) {
		try {
			let result = aFunction();
			if (this.isPromise(result)) {
				return result.catch((e) => {
					return this.manage(e, aPostFunction);
				});
			} else {
				return result;
			}
		} catch(e) {
			return this.manage(e, aPostFunction);
		}
	}

};
