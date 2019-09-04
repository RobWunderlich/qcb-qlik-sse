const q = require('qlik-sse');
const sessionMgr = require('../../lib/Qlik/QlikSession');
const helper = require('../../lib/Qlik/QlikHelper');

const functionConfig = {
    name: 'CreateMeasure',
    functionType: q.sse.FunctionType.SCALAR,
    returnType: q.sse.DataType.STRING,
    params: [
      {
      name: 'name',
      dataType: q.sse.DataType.STRING,
      },
      {
        name: 'def',
        dataType: q.sse.DataType.STRING,
      }
    ],
}

/**
 * Create a Measure in the calling app.
 * @function CreateMeasure
 * @param {string} name
 * @param {string} defintion
 * @returns {string} status - "Created" or "Replaced" plus any validation error messages.
 * @example
 * CreateMeasure(nameField, defField)
 * @example
 * CreateMeasure('Total Sales', 'Sum(Sales)')
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
          result = await DoCreateMeasure({name: name,  def: def, commonHeader: common})
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

const DoCreateMeasure = async function DoCreateMeasure({name, def, commonHeader}) {
  let retVal = 'False'
  const measureDef = {
    qInfo: {
         qType: "measure"
    },
    qMeasure: {
        qLabel: `${name}`,
        qDef: `${def}`,  
    },
    qMetaDef: {
        title: `${name}`,
        description: "",
        tags: []
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
    if (!measureId) {   // Measure does not exist
      measure = await doc.createMeasure(measureDef)
      retVal = 'Created';
    } else {  // Measure exists, update the properties with the new def
      measure = await doc.getMeasure(measureId)
      let prop = await measure.getProperties()
      prop.qMeasure.qDef = def
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
    let checkValue = await doc.checkExpression(def)
    if (checkValue.qErrorMsg) {
      retVal += '; ' + checkValue.qErrorMsg
    }
    if (checkValue.qBadFieldNames.length > 0) {
      retVal += '; Bad field names: ' + checkValue.qBadFieldNames.map((elem) => def.substr(elem.qFrom, elem.qCount)).join(', ')
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