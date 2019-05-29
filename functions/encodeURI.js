const q = require('qlik-sse');

const functionConfig = {
    name: 'EncodeURI',
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
 * Encodes a Uniform Resource Identifier (URI).
 * @function EncodeURI
 * @param {string} str
 * @returns {string}   
 * @example
 * EncodeURI('my test.asp?name=ståle&car=saab')  // returns 'my%20test.asp?name=st%C3%A5le&car=saab'
 */
  const functionDefinition = function regexTest(request) {
    request.on('data', (bundle) => {
      try {
        const rows = [];
        bundle.rows.forEach((row) => {
          let str = row.duals[0].strData
          let result = encodeURI(str)
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