# qcb-qlik-sse
## Project Status
**Experimental**

An implementation of [qlik-sse](https://github.com/miralemd/qlik-sse), a Qlik Server Side Extension written in Javascript. The aim of this implementation is to allow for adding functions through a plugin directory. 

This is an experimental project intended to explore creation of a "community contributed" Qlik Server Side Extension (SSE). The SSE feature in Qlik is very useful, but it's possible that over time customers may end up running and managing a number of different SSE tasks. This projects aims to explore if a repository of common SSE functions can be developed and deployed.

## Project Structure

### /functions
  
Contains functions to be added to the server. Each function is written as an individual .js files. Subdirectories are allowed. 

The functions must export the following symbols:

* `functionDefinition`  the function that will be used as the first parameter to [server.addFunction(fn, config)](https://github.com/miralemd/qlik-sse/blob/master/docs/api.md).

* `functionConfig` an object that that will be used as the second parameter to [server.addFunction(fn, config)](https://github.com/miralemd/qlik-sse/blob/master/docs/api.md).

Functions should catch any potential errors.  An uncaught error may terminate the entire server task.

Read more about writing functions in the [qlik-sse doc](https://github.com/miralemd/qlik-sse/blob/master/README.md)

### Running the Server
Configure the SSE in your Qlik installation by following [these instructions](https://github.com/qlik-oss/server-side-extension/blob/master/docs/configuration.md)

`node index.js [options]`

startup options:

* `--allowScript=true`  enable inline script execution.
* `--port n`  specify server port. Default is 50051.

## Contributions
Contributions are welcome. Please fork the project and submit a PR. 

I'm particularly looking for contributions of:
* New functions
* Convenience classes or restructing ideas that make implementing new function easier or more robust.