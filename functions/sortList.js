const q = require('qlik-sse');

const functionConfig = {
    name: 'SortList',
    functionType: q.sse.FunctionType.SCALAR,
    returnType: q.sse.DataType.STRING,
    params: [
      {
        name: 'str',
        dataType: q.sse.DataType.STRING,
      },
      {
        name: 'separator',
        dataType: q.sse.DataType.STRING,
      }
    ],
  }
/**
 * Sorts the elements of a string list into alphabetical order. Leading and trailing spaces are removed from the elements. 
 * <p>A string list is a string where the elements are separated by a common delimiter. 
 * @function SortList
 * @param {string} str
 * @param {string} separator
 * @returns {string} text - The text value, which should be the HTML string minus tag elements.  
 * @example
 * SortList('John, Zack, Aaron', ',')  // returns 'Aaron,John,Zack'
 * @example
 * SortList('John| Zack| Aaron' '|')  // returns 'Aaron|John|Zack'
 */
  const functionDefinition = function regexTest(request) {
    request.on('data', (bundle) => {
      try {
        const rows = [];
        bundle.rows.forEach((row) => {
          let str = row.duals[0].strData;
          let sep = row.duals[1].strData || ',';
          let result = str.split(sep).map((x)=>x.trim()).sort().join(sep)
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