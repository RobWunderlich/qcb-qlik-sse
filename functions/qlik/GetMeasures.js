const q = require('qlik-sse');
const sessionMgr = require('../../lib/Qlik/QlikSession');
const helper = require('../../lib/Qlik/QlikHelper');

const functionConfig = {
    name: 'GetMeasures',
    functionType: q.sse.FunctionType.TENSOR,
    returnType: q.sse.DataType.STRING,
    params: [
      {
      name: 'appid',
      dataType: q.sse.DataType.STRING,
      }
    ],
}
const tableDescription = q.sse.TableDescription.encode(
  {
    fields: [  
      {name: 'MeasureProps', dataType: q.sse.DataType.STRING},  
    ]
  }).buffer

/**
 * Load Measures as JSON from an app.
 * <br>Current SSE specification requires AppId to be specified as a Field.
 * @function GetMeasures
 * @param {tabledescription} Tablename{AppId}
 * @returns {string} json Measure(s)
 * @example
 * TempId:
 * LOAD '\Documents\Qlik\Sense\Apps\Sales Discovery.qvf' as AppId
 * AutoGenerate 1;
 * 
 * LoadedMeasures:
 * Load * Extension QCB.GetMeasures(TempId{AppId});
 */
  const functionDefinition = async function LoadMeasures(request) {
    request.on('data', async (bundle) => {
      try {
        const common = q.sse.CommonRequestHeader.decode(request.metadata.get('qlik-commonrequestheader-bin')[0]);
        const rows = [];
        let result = 0
        for (const row of bundle.rows) {
          let appId = row.duals[0].strData
          let measures  = await getMeasures({appId: appId,  commonHeader: common})
          measures.forEach((measure) =>{
            //console.log(JSON.stringify(measure))
            rows.push({
              duals: [{ strData: JSON.stringify(measure)}]
            })
          })
        }
        request.metadata.add('qlik-tabledescription-bin', tableDescription)
        request.sendMetadata(request.metadata)
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

const getMeasures = async function getMeasures({appId, commonHeader}) { 
  let session = null
  let measures = []
  try {
    session = sessionMgr.getSession(commonHeader);
    global = await session.open()
    doc = await global.openDoc(appId)
    measures = await helper.getMeasures(doc)
  } catch (err) {
    measures.push('Error: ' + err.toString())
    console.log(err)
  }
  finally {
    if (session) {
      session = await sessionMgr.closeSession(session)
    }
  }
  return measures
}

module.exports = {
  functionDefinition,
  functionConfig
};