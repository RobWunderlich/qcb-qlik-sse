const q = require('qlik-sse');

const functionConfig = {
    name: 'RegexTest',
    functionType: q.sse.FunctionType.SCALAR,
    returnType: q.sse.DataType.NUMERIC,
    params: [
      {
      name: 'stringToTest',
      dataType: q.sse.DataType.STRING,
      },
      {
        name: 'pattern',
        dataType: q.sse.DataType.STRING,
      }
    ],
  }
/**
 * Tests a string for match with a regular expression.
 * @function RegexTest
 * @param {string} stringToTest - The string to test with the regular expression.
 * @param {string} pattern - The regular expression pattern to use in the test.
 * @returns {number} boolean - 0 if false, -1 if true. 
 */
  const functionDefinition = function regexTest(request) {
    request.on('data', (bundle) => {
      try {
        const rows = [];
        let result = 0;
        bundle.rows.forEach((row) => {
          let stringToTest = row.duals[0].strData;
          let pattern = RegExp(row.duals[1].strData);
          result = pattern.test(stringToTest);
          rows.push({
            duals: [{ numData: result ? -1 : 0}]
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