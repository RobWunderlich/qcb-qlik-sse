const q = require('qlik-sse');
const fs = require('fs');

const functionConfig = {
    name: 'LoadFileToString',
    functionType: q.sse.FunctionType.SCALAR,
    returnType: q.sse.DataType.STRING,
    params: [
      {
      name: 'path',
      dataType: q.sse.DataType.STRING,
      }
    ],
  }
/**
 * Load file contents into a string.
 * @function LoadFileToString
 * @param {string} path absolute or relative to SSE task
 * @returns {string} file contents as string
 * @example
 * LoadFileToString('./SupportScript.qvs')
 */
  const functionDefinition = function LoadFileToString(request) {
    request.on('data', (bundle) => {
      try {
        const rows = [];
        bundle.rows.forEach((row, index) => {
          rows.push({
            duals: [{ strData: DoLoadFile(row.duals[0].strData) }]
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

function DoLoadFile(path) {
  let result;
  try {
    result = fs.readFileSync(path, 'utf8')  
  } catch(e) {
    result = 'Error: ' +  e.message
  }
  return result
}

module.exports = {
  functionDefinition,
  functionConfig
};