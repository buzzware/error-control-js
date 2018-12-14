import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default [

	// {
	// 	input: 'src/main.js',
	// 	output: {
	// 		name: 'ErrorControl',
	// 		file: pkg.browser,
	// 		format: 'umd'						// browser-friendly UMD build
	// 	},
	// 	plugins: [
	// 		resolve(), // so Rollup can find `ms`
	// 		commonjs() // so Rollup can convert `ms` to an ES module
	// 	]
	// },

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify 
	// `file` and `format` for each target)
	//
	{
		input: 'src/StandardException.js',
		output: [
			{ file: 'dist/cjs/StandardException.js', format: 'cjs' },
			{ file: 'dist/es/StandardException.js', format: 'es' }
		]
	},

	{
		input: 'src/ErrorControl.js',
		output: [
			{ file: 'dist/cjs/ErrorControl.js', format: 'cjs' },
			{ file: 'dist/es/ErrorControl.js', format: 'es' }
		]
	},

	{
		input: 'src/ErrorControlPackage.js',
		external: [],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify
	// `file` and `format` for each target)
	{
		input: 'src/HttpErrors.js',
		external: ['./StandardException'],
		output: [
			{ file: 'dist/cjs/HttpErrors.js', format: 'cjs' },
			{ file: 'dist/es/HttpErrors.js', format: 'es' }
		]
	},

	// {
	// 	input: 'src/FrontEndErrors.js',
	// 	external: ['./StandardException'],
	// 	output: [
	// 		{ file: 'dist/cjs/FrontEndErrors.js', format: 'cjs' },
	// 		{ file: 'dist/es/FrontEndErrors.js', format: 'es' }
	// 	]
	// },

	{
		input: 'src/UserErrors.js',
		external: ['./StandardException'],
		output: [
			{ file: 'dist/cjs/UserErrors.js', format: 'cjs' },
			{ file: 'dist/es/UserErrors.js', format: 'es' }
		]
	}
];
