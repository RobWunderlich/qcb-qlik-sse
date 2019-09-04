const q = require('qlik-sse');

const functionConfig = {
    name: 'ExtractHtmlText',
    functionType: q.sse.FunctionType.SCALAR,
    returnType: q.sse.DataType.STRING,
    params: [
      {
      name: 'htmlString',
      dataType: q.sse.DataType.STRING,
      }
    ],
  }
/**
 * Extracts text node contents from an HTML string.
 * @function ExtractHtmlText
 * @param {string} htmlString
 * @returns {string} text - The text value, which should be the HTML string minus tag elements.  
 */
  const functionDefinition = function extractHtmlText(request) {
    request.on('data', (bundle) => {
      try {
        const rows = [];
        bundle.rows.forEach((row) => {
          let result = row.duals[0].strData.replace(/<\/?[a-z][a-z0-9]*[^<>]*>|<!--.*?-->/g, '');
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