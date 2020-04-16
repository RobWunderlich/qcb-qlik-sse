const q = require('qlik-sse');
const sessionMgr = require('../../lib/Qlik/QlikSession');
const helper = require('../../lib/Qlik/QlikHelper');

const functionConfig = {
  name: 'CreateMeasure',
  functionType: q.sse.FunctionType.SCALAR,
  returnType: q.sse.DataType.STRING,
  params: [{
      name: 'name',
      dataType: q.sse.DataType.STRING,
    },
    {
      name: 'def',
      dataType: q.sse.DataType.STRING,
    },
    {
      name: 'desc',
      dataType: q.sse.DataType.STRING,
    },
    {
      name: 'tags',
      dataType: q.sse.DataType.STRING,
    },
    {
      name: 'label',
      dataType: q.sse.DataType.STRING,
    }
  ]
}

/**
 * Create a Measure in the calling app.
 * @function CreateMeasure
 * @param {string} name
 * @param {string} definition
 * @param {string} description
 * @param {string} tags
 * @param {string} label
 * @returns {string} status - "Created" or "Replaced" plus any validation error messages.
 * @example
 * CreateMeasure(nameField, defField, descField,tagsField,labelField)
 * @example
 * CreateMeasure('Total Sales', 'Sum(Sales)','Total Sales Aggregation Master Item','KPI,Annual','='Sales extraction date:'& today()')
 */


const functionDefinition = async function CreateMeasure(request) {
  request.on('data', async (bundle) => {
    try {
      const common = q.sse.CommonRequestHeader.decode(request.metadata.get('qlik-commonrequestheader-bin')[0]);
      const rows = [];
      let result = 0
      for (const row of bundle.rows) {
        let name = row.duals[0].strData
        let def = row.duals[1].strData
        let desc = row.duals[2].strData
        let tags = row.duals[3].strData
        let label = row.duals[4].strData
        result = await DoCreateMeasure({
          name: name,
          def: def,
          desc: desc,
          tags: tags,
          label: label,
          commonHeader: common
        })
        rows.push({
          duals: [{
            strData: result
          }]
        })
      }
      request.write({
        rows
      })
      request.end()
    } catch (error) {
      console.log(error)
    }
  });
}

const DoCreateMeasure = async function DoCreateMeasure({
  name,
  def,
  desc,
  tags,
  label,
  commonHeader
}) {

  let retVal = 'False'

  const measureDef = {
    qInfo: {
      qType: "measure"
    },
    qMeasure: {
      qLabel: `${name}`,
      qDef: `${def}`,
      qLabelExpression: `${label}`
    },
    qMetaDef: {
      title: `${name}`,
      description: `${desc}`,
      tags: tags.split(/[,;]+/)
    }
  }

  let isDesktop = commonHeader.userId == 'Personal\\Me'
  let session = null
  try {
    session = sessionMgr.getSession(commonHeader);
    let measure
    global = await session.open()
    doc = await global.openDoc(commonHeader.appId)
    let measureId = await helper.findMeasureByTitle(doc, name)
    if (!measureId) { // Measure does not exist
      measure = await doc.createMeasure(measureDef)
      retVal = 'Created';
    } else { // Measure exists, update the properties with the new def
      measure = await doc.getMeasure(measureId)
      let prop = await measure.getProperties()
      prop.qMeasure.qDef = def
      prop.qMeasure.qLabelExpression = label
      prop.qMetaDef.description = desc
      prop.qMetaDef.tags = tags.split(/[,;]+/)
      await measure.setProperties(prop)
      retVal = 'Replaced';
    }
    // Persist the measure
    docprop = await doc.getAppProperties()
    if (docprop.published) {
      await measure.publish()
      await measure.approve()
    }
    if (isDesktop) {
      await doc.doSave()
    }
    // Syntax Measure Definition check the measure and record result
    let checkValue = await doc.checkExpression(def)
    if (checkValue.qErrorMsg) {
      retVal += '; ' + checkValue.qErrorMsg
    }
    if (checkValue.qBadFieldNames.length > 0) {
      retVal += '; Bad field names in expression: ' + checkValue.qBadFieldNames.map((elem) => def.substr(elem.qFrom, elem.qCount)).join(', ')
    }

    // Syntax Label Expression check the measure and record result
    let checkLabel = await doc.checkExpression(label)
    if (checkLabel.qErrorMsg) {
      retVal += '; ' + checkLabel.qErrorMsg
    }
    if (checkLabel.qBadFieldNames.length > 0) {
      retVal += '; Bad field names in label expression: ' + checkLabel.qBadFieldNames.map((elem) => def.substr(elem.qFrom, elem.qCount)).join(', ')
    }

    session = await sessionMgr.closeSession(session)
  } catch (err) {
    retVal = 'Error: ' + err.toString()
    console.log(err)
    if (session) {
      session = await sessionMgr.closeSession(session)
    }
  }
  return Promise.resolve(retVal)
}

module.exports = {
  functionDefinition,
  functionConfig
};