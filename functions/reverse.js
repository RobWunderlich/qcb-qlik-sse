const q = require('qlik-sse');

const functionConfig = {
    name: 'Reverse',
    functionType: q.sse.FunctionType.SCALAR,
    returnType: q.sse.DataType.STRING,
    params: [
      {
        name: 'str',
        dataType: q.sse.DataType.STRING,
      }
    ],
  }
/**
 * Reverses the characters in a string.
 * @function Reverse
 * @param {string} str
 * @returns {string}   
 * @example
 * Reverse('Hello World')  // returns 'dlroW olleH'
 */
  const functionDefinition = function regexTest(request) {
    request.on('data', (bundle) => {
      try {
        const rows = [];
        bundle.rows.forEach((row) => {
          let str = row.duals[0].strData
          let result = str.split("").reverse().join("")
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