const q = require('qlik-sse');
const sessionMgr = require('../../lib/Qlik/QlikSession');
const helper = require('../../lib/Qlik/QlikHelper');

const functionConfig = {
    name: 'CreateMeasureFromProperties',
    functionType: q.sse.FunctionType.SCALAR,
    returnType: q.sse.DataType.STRING,
    params: [
      {
      name: 'obj',
      dataType: q.sse.DataType.STRING,
      },
    ],
}

/**
 * Create a Measure in the calling app.
 * @function CreateMeasureFromProperties
 * @param {string} props - MeasureProps in JSON format
 * @returns {string} status - "Created" or "Replaced" plus any validation error messages.
 * @example
 * CreateMeasureFromProperties(measureDefField)
 */
  const functionDefinition = async function CreateMeasureFromProperties(request) {
    request.on('data', async (bundle) => {
      try {
        const common = q.sse.CommonRequestHeader.decode(request.metadata.get('qlik-commonrequestheader-bin')[0]);
        const rows = [];
        let result = 0
        for (const row of bundle.rows) {
          let props = row.duals[0].strData
          result = await DoCreateMeasure({props: props, commonHeader: common})
          rows.push({
            duals: [{ strData: result}]
          })
        }
        request.write({
          rows
        })
        request.end()
      }
      catch (error) {
        console.log(error)
      }
  });
}

const DoCreateMeasure = async function DoCreateMeasure({props, commonHeader}) {
  let retVal = 'False'
  const obj = JSON.parse(props)

  let isDesktop = commonHeader.userId == 'Personal\\Me'  
  let session = null
  try {
    session = sessionMgr.getSession(commonHeader);
    let measure
    global = await session.open()
    doc = await global.openDoc(commonHeader.appId)
    let measureId = await helper.findMeasureByTitle(doc, obj.qMetaDef.title)
    if (!measureId) {   // Measure does not exist
      measure = await doc.createMeasure(obj)
      retVal = 'Created';
    } else {  // Measure exists, update the properties with the input
      measure = await doc.getMeasure(measureId)
      let prop = await measure.getProperties()  // Current properties 
      prop = Object.assign(prop, obj) // Update with new properties
      prop.qInfo.qId = measureId  // Restore the qId
      await measure.setProperties(prop) 
      retVal = 'Replaced';   
    }
    // Persist the measure
    docprop = await doc.getAppProperties()
    if (docprop.published) {
        await measure.publish()
        await measure.approve()
    }
    if (isDesktop)         {
      await doc.doSave()
    }  
    // Syntax check the measure and record result
    let def = obj.qMeasure.qDef
    let checkValue = await doc.checkExpression(def)
    if (checkValue.qErrorMsg) {
      retVal += '; ' + checkValue.qErrorMsg
    }
    if (checkValue.qBadFieldNames.length > 0) {
      retVal += '; Bad field names: ' + checkValue.qBadFieldNames.map((elem) => def.substr(elem.qFrom, elem.qCount)).join(', ')
    }
  } 
  catch (err) {
    retVal = 'Error: ' + err.toString()
    console.log(err)
  }
  finally {
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