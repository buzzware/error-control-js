# Error Control

This library provides a simple framework for managing errors in Javascript 
applications in the browser and server.

The features are :

* StandardException base class, extendable in the browser and server
* A library of exception classes for each each HTTP error
* A global ErrorControl class providing :
    * an abstract exception factory
    * an abstract exception filter framework for normalising exceptions by wrapping, converting and 
    smothering arbitrary exceptions into a known set.
    * a guard for calling a function (or lambda) of code safely. The function result will be returned 
    to external code, and any exceptions will be filtered and rethrown or smothered.
    * an abstract reporting framework for eg. logging and reporting errors to an error reporting service

The default import is ErrorControlPackage which includes everything, or you can import separate files (see the dist folder)

## License

[MIT](LICENSE).
