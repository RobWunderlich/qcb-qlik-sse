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
 * @example
 * ExampleScalar(field1, field2)
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
          rows.push({
            duals: [{ numData: CompareNums(row.duals[0].numData, row.duals[1].numData) }]
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

// It's probably clearest to put the behavior in a separate function from the bundle/row logic
function CompareNums(num1, num2) {
  return num1 > num2 ? -1 : 0
}

module.exports = {
  functionDefinition,
  functionConfig
};