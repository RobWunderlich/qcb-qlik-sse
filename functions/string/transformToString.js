const q = require('qlik-sse')
const pug = require('pug')
const papa = require('papaparse')

const functionConfig = {
    name: "TransformToString",
    functionType: q.sse.FunctionType.AGGREGATION,
    returnType: q.sse.DataType.STRING,
    params: [
      {
        name: 'rowdata',
        dataType: q.sse.DataType.STRING,
      },
      {
        name: 'inputFormat',
        dataType: q.sse.DataType.STRING,
      },
      {
        name: 'template',
        dataType: q.sse.DataType.STRING,
      },
    ],
  }
  /**
 * Transform rows of data to a string using a template. Currently only pug templates supported. 
 * @function TransformToString
 * @param {string} rowdata - row data
 * @param {string} inputFormat - one of 'csv' or 'json' 
 * @param {string} template - name of .pug template, default "HtmlTableSimple.pug"
 * @returns {string} transformed rows as a single string
 * @example
 * Load 
 *   QCB.TransformToString(rowdata, 'csv', '')
 * Resident RecentSales;
 */

  const functionDefinition = function TransformToString(request) {
    request.on('data', (bundle) => {
      try {
        const rows = []
        let rowdata = []
        const template = bundle.rows[0].duals[2].strData
        let inputFormat =  bundle.rows[0].duals[1].strData.toLowerCase()
        let result = null
        if (inputFormat === 'json') {
          for (const row of bundle.rows) {
            rowdata.push(JSON.parse(row.duals[0].strData))
          }
        } else if (inputFormat === 'csv') {
          let str = '';
          for (const row of bundle.rows) {
            str += row.duals[0].strData + '\n'
          }
          rowdata = papa.parse(str, {header: true}).data
        } else {
          result = 'Error: TransformToString() unknown inputFormat "' + inputFormat + '"'
        }
        if (result == null) {
          result = DoTransform(
            rowdata,
            template
            )
        }
        rows.push({
          duals: [{ strData: result }],
        })
        request.write({
          rows,
        })
      }
      catch (error) {
        console.log(error)
      }
    })
  }
  function DoTransform(rowdata, template) {
    template = !template ? 'HtmlTableSimple.pug' : (template.indexOf('.') == 0 ? template += '.pug' : template)
    return pug.renderFile('lib/template/' + template, {rowdata: rowdata})
  }

  module.exports = {
    functionDefinition,
    functionConfig,
  }