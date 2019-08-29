// Sample of Tensor function. This function should be used with the "LOAD .. Extension" script syntax.
const q = require('qlik-sse');
const functionConfig = {
    name: "ExampleTensor",
    functionType: q.sse.FunctionType.TENSOR,
    returnType: q.sse.DataType.STRING,
    params: [{
      name: 'dim',
      dataType: q.sse.DataType.STRING,
      },
      {
        name: 'value',
        dataType: q.sse.DataType.NUMERIC,
      }
    ],
  }
  const tableDescription = q.sse.TableDescription.encode(
  {
    fields: [  
      {name: 'Dim', dataType: q.sse.DataType.STRING},
      {name: 'Value', dataType: q.sse.DataType.NUMERIC},    
    ]
  }).buffer
 /**
 * Sample of Tensor FunctionType. 
 * <p>Aggregates column2 values by column1 dim values. 
 * <p>Same as script "LOAD Col1 as Dim, Sum(Col2) as Value FROM .. Group By Col1"
 * @function ExampleTensor
 * @param {tabledescription} tablename{dim, value} - describing two fields, dim being Dimension, value is field to aggregate. See 
 * @returns {table} table with two columns, "Dim", "Value"
 */

  const functionDefinition = function Sum(request) {
    let bundleNum = 0;
    request.on('data', (bundle) => {
      console.log('ExampleTensor: Bundle number ', ++bundleNum, bundle) 
      try {
        const rows = [];
        let v = 0;
        const dims = []
        bundle.rows.forEach((row, index) => {
          console.log('ExampleTensor: Row number ', index, row)
          let value = row.duals[1].numData
          value = Number.isNaN(value) ? 0 : value
          let dim = row.duals[0].strData
          let dimobj = dims.find(dimobj => {
            return dimobj.dim === dim
          })
          if(dimobj == undefined) {
            dimobj = {dim: dim, value: 0}
            dims.push(dimobj)
          }
          dimobj.value += value
        });
        dims.forEach((dimobj) => {
          rows.push({
            duals: [{ strData: dimobj.dim }, { numData: dimobj.value },],
          });
        })
        
        console.log('ExampleTensor: Writing ', rows) 
        request.metadata.add('qlik-tabledescription-bin', tableDescription)
        request.sendMetadata(request.metadata)
        request.write({
          rows,
        });
      }
      catch (error) {
        console.log(error)
      }
      
    });
  }
  
  module.exports = {
    functionDefinition,
    functionConfig,
  };