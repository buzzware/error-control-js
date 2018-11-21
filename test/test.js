var expect = require('chai').expect;

var error_control = require('../dist/cjs/ErrorControl');
const StandardException = error_control.StandardException;
const ErrorControl = error_control.ErrorControl;

var HttpErrors = require('../dist/cjs/HttpErrors');

describe('error_control',function(){
	it('has exports',function(){

		expect(StandardException).to.exist;
		expect(ErrorControl).to.exist;

	});
});

describe('HttpErrors',function(){
	it('has exports',function(){

		expect(HttpErrors.NotFoundError).to.exist;

	});
});
