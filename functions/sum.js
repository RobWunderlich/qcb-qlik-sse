const q = require('qlik-sse');
const functionConfig = {
    name: "Sum",
    functionType: q.sse.FunctionType.AGGREGATION,
    returnType: q.sse.DataType.NUMERIC,
    params: [{
      name: 'num',
      dataType: q.sse.DataType.NUMERIC,
    }],
  }
  /**
 * Sums the value of a field. Same as Qlik Sum(), but I needed an example of creating an Aggregation function. 
 * @function RegexTest
 * @param {string} fieldname 
 * @returns {number} 
 */

  const functionDefinition = function Sum(request) {
    request.on('data', (bundle) => {
      try {
        const rows = [];
        let v = 0;
        bundle.rows.forEach((row) => {
          row.duals.forEach((dual) => {
            if (!Number.isNaN(dual.numData)) {
              v += dual.numData;
            }
          });
        });
        // Aggregation function, 
        rows.push({
          duals: [{ numData: v }],
        });
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