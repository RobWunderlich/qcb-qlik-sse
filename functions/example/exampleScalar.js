const q = require('qlik-sse');

const functionConfig = {
    name: 'ExampleScalar',
    functionType: q.sse.FunctionType.SCALAR,
    returnType: q.sse.DataType.NUMERIC,
    params: [
      {
      name: 'num1',
      dataType: q.sse.DataType.NUMERIC,
      },
      {
        name: 'num2',
        dataType: q.sse.DataType.NUMERIC,
      }
    ],
  }
/**
 * Sample of Scalar FunctionType. Returns true if num1 GT num2, otherwise false
 * @function ExampleScalar
 * @param {string} num1
 * @param {string} num2
 * @returns {number} boolean
 */
  const functionDefinition = function ExampleScalar(request) {
    let bundleNum = 0;
    request.on('data', (bundle) => {
      console.log('ExampleScalar: Bundle number ', ++bundleNum, bundle) 
      try {
        const rows = [];
        let result = 0;
        bundle.rows.forEach((row, index) => {
          console.log('ExampleScalar: Row number ', index, row)
          result = row.duals[0].numData > row.duals[1].numData
          rows.push({
            duals: [{ numData: result ? -1 : 0}]
          });
        }); 
        console.log('ExampleScalar: Writing ', rows)     
        request.write({
          rows
        });
      }
      catch (error) {
        console.log(error)
      }
  });
}


module.exports = {
  functionDefinition,
  functionConfig
};