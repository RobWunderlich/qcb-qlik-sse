const q = require('qlik-sse');

const functionConfig = {
    name: 'DecodeURIComponent',
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
 * The decodeURIComponent() function decodes a Uniform Resource Identifier (URI) component previously created by encodeURIComponent or by a similar routine.
 * @function DecodeURIComponent
 * @param {string} str
 * @returns {string}   
 * @example
 * EncodeURIComponent('https%3A%2F%2Fw3schools.com%2Fmy%20test.asp%3Fname%3Dst%C3%A5le%26car%3Dsaab')  // returns 'https://w3schools.com/my test.asp?name=ståle&car=saab'
 */
  const functionDefinition = function QCB_DecodeURIComponent(request) {
    request.on('data', (bundle) => {
      try {
        const rows = [];
        bundle.rows.forEach((row) => {
          let str = row.duals[0].strData
          let result = decodeURIComponent(str)
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