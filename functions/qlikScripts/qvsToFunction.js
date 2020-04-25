const q       = require('qlik-sse');
const qvsList = require('../../lib/QlikScripts/qvs-list');


function CreateFunctionConfig(functionName, paramList){


    var functionConfig  = {
      name: functionName,
      functionType: q.sse.FunctionType.SCALAR,
      returnType: q.sse.DataType.STRING,
      params: [],
    };
  
    //Insert all parameters in functionConfig
    paramList.forEach((row) => {
  
      functionConfig.params.push({name: row, dataType: q.sse.DataType.STRING})

    }); 
  
    return functionConfig;
  
}

function CreatefunctionDefinition(fDefinitionRaw,fParams){


  var functionDefinition =  function (request) {
    request.on('data', (bundle)=>{
      try{

        var iterador=0;

        dualsList = bundle.rows[0].duals;

        fDefinition=fDefinitionRaw;
        
        //replace #{} params in the QVS by the input user.
        fParams.forEach(function (p){

          share = eval('/#{'+p+'}/g')
          replaceWith = dualsList[iterador].strData;

          fDefinition =fDefinition.replace(share,replaceWith);

          iterador=iterador+1;

        });
        

        const toQlik = {
          rows: [{
            duals: [{ 
              strData: fDefinition, 
            }]
          }]};

      request.write(toQlik);

      }catch(error){

        console.log(error)

      }
    });
  }

  return functionDefinition;
}



functionsList =[];
/**
 * Create a functionConfig and functionDefinition per QVS file in qvsList.
 */
qvsList.forEach( function(qvs){

  functionConfig      = CreateFunctionConfig(qvs.FunctionName,qvs.FunctionParams)

  functionDefinition  = CreatefunctionDefinition(qvs.FunctionDefinition,qvs.FunctionParams)

  functionsList.push({functionDefinition,functionConfig});

});



module.exports = functionsList;

