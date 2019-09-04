const q = require('qlik-sse');
const functionConfig = {
    name: "ExampleAggregation",
    functionType: q.sse.FunctionType.AGGREGATION,
    returnType: q.sse.DataType.NUMERIC,
    params: [{
      name: 'num',
      dataType: q.sse.DataType.NUMERIC,
    }],
  }
  /**
 * Sample of Aggregation FunctionType. Sums the value of a field, same as Qlik Sum(). 
 * @function ExampleAggregation
 * @memberof Examples 
 * @param {string} fieldname 
 * @returns {number} 
 * @example
 * ExampleAggregation(myfield)
 */

  const functionDefinition = function ExampleAggregation(request) {
    let bundleNum = 0;
    request.on('data', (bundle) => {
      console.log('ExampleAggregation: Bundle number ', ++bundleNum, bundle) 
      try {
        const rows = [];
        let v = 0;
        bundle.rows.forEach((row, index) => {
          console.log('ExampleAggregation: Row number ', index, row)
          row.duals.forEach((dual) => {
            if (!Number.isNaN(dual.numData)) {
              v += dual.numData;
            }
          });
        });
        rows.push({
          duals: [{ numData: v }],
        });
        console.log('ExampleAggregation: Writing ', rows) 
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