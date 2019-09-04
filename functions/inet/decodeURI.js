const q = require('qlik-sse');

const functionConfig = {
    name: 'DecodeURI',
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
 * The decodeURI() function decodes a Uniform Resource Identifier (URI) previously created by encodeURI() or by a similar routine.
 * @function DecodeURI
 * @param {string} str
 * @returns {string}   
 * @example
 * DecodeURI('my%20test.asp?name=st%C3%A5le&car=saab')  // returns 'my test.asp?name=ståle&car=saab'
 */
  const functionDefinition = function QCB_DecodeURI(request) {
    request.on('data', (bundle) => {
      try {
        const rows = [];
        bundle.rows.forEach((row) => {
          let str = row.duals[0].strData
          let result = decodeURI(str)
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