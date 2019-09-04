const q = require('qlik-sse');
const argv = require('yargs')
  .options({
    allowScript: {default: false},
    port: {default: 50051}
  }).argv

  let allowScript = null
  if (argv.allowScript) {
    allowScript = {
      scriptAggr: true,
      scriptAggrStr: true,
      scriptAggrEx: true,
      scriptAggrExStr: true,
      scriptEval: true,
      scriptEvalStr: true,
      scriptEvalEx: true,
      scriptEvalExStr: true,
      } 
  }
// create an instance of the server
const s = q.server({
  identifier: 'qcbsse',
  version: '0.1.0',
  allowScript,
});

var libs = require('require-all')({
  dirname : __dirname + '/functions',
  recursive : true
})
Object.values(libs).forEach((mod) => {
  registerFunction(mod)
})

// start the server
s.start({
  port: argv.port
});

// Functions should catch thier own errors.  This process.on() is a last
// ditch effort to keep an uncaught function error from crashing the process.
process.on('uncaughtException', (err) => {
  console.log(">>> Uncaught Exception: " + err.message)
  console.log(err.stack)
});

// Register this function if it contains function metadata
function registerFunction(mod) {
  if(mod.functionDefinition && mod.functionConfig) {
    console.log('Registering function ' + mod.functionConfig.name || mod.functionDefinition.name)
    s.addFunction(mod.functionDefinition, mod.functionConfig)
  } 
  else {  // May be a subdirectory, recourse it looking for functions.
    Object.values(mod).forEach((submod) => {
      registerFunction(submod)
    })
  }
}

  

