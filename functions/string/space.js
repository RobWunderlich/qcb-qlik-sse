const q = require('qlik-sse');

const functionConfig = {
    name: 'Space',
    functionType: q.sse.FunctionType.SCALAR,
    returnType: q.sse.DataType.STRING,
    params: [
      {
        name: 'str',
        dataType: q.sse.DataType.STRING,
      },
      {
        name: 'count',
        dataType: q.sse.DataType.NUMERIC,
      }
    ],
  }
/**
 * Replace multiple spaces between words with count spaces.
 * @function Space
 * @param {string} str
 * @param {number} count
 * @returns {string}   
 * @example
 * Space('Sometimes    more than     one', 1)  // returns 'Sometimes more than one'
 */
  const functionDefinition = function space(request) {
    request.on('data', (bundle) => {
      try {
        const rows = [];
        bundle.rows.forEach((row) => {
          let str = row.duals[0].strData
          let count = row.duals[1].numData
          let result = str.split(' ').filter((s) => s.trim().length > 0).join(' '.repeat(count))
          rows.push({
            duals: [{ strData: result}]
          });
        });     
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