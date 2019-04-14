# qcb-qlik-sse

An implementation of [qlik-sse](https://github.com/miralemd/qlik-sse), a Qlik Server Side Extension written in Javascript. The aim of this impelmentation is to allow for adding functions through a plugin directory. 

## Project Structure

### /functions
  
Contains functions to be added to the server. Each function is written as an individual .js files.

The functions must export the following symbols:

*  `functionDefinition`  the function that will be used as the first parameter to [server.addFunction(fn, config)](https://github.com/miralemd/qlik-sse/blob/master/docs/api.md).

* `functionConfig` an object that that will be used as the second parameter to [server.addFunction(fn, config)](https://github.com/miralemd/qlik-sse/blob/master/docs/api.md).

Functions should catch any potential errors.  An uncaught error may terminate the entire server task. 

### Running the Server
`node server.js`
