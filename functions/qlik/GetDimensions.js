const q = require('qlik-sse');
const sessionMgr = require('../../lib/Qlik/QlikSession');
const helper = require('../../lib/Qlik/QlikHelper');

const functionConfig = {
    name: 'GetDimensions',
    functionType: q.sse.FunctionType.TENSOR,
    returnType: q.sse.DataType.STRING,
    params: [{
        name: 'appid',
        dataType: q.sse.DataType.STRING,
    }],
}

const tableDescription = q.sse.TableDescription.encode({
    fields: [{
        name: 'DimensionProps',
        dataType: q.sse.DataType.STRING
    }, ]
}).buffer

/**
 * Load Dimensions as JSON from an app.
 * <br>Current SSE specification requires AppId to be specified as a Field.
 * @function GetDimensions
 * @param {tabledescription} Tablename{AppId}
 * @returns {string} json Dimension(s)
 * @example
 * TempId:
 * LOAD '\Documents\Qlik\Sense\Apps\Sales Discovery.qvf' as AppId
 * AutoGenerate 1;
 * 
 * LoadedDimensions:
 * Load * Extension QCB.GetDimensions(TempId{AppId});
 */


const functionDefinition = async function LoadDimensions(request) {
    request.on('data', async (bundle) => {
        try {
            const common = q.sse.CommonRequestHeader.decode(request.metadata.get('qlik-commonrequestheader-bin')[0]);
            const rows = [];
            let result = 0
            for (const row of bundle.rows) {
                let appId = row.duals[0].strData
                let dimensions = await getDimensions({
                    appId: appId,
                    commonHeader: common
                })
                dimensions.forEach((dimension) => {
                    rows.push({
                        duals: [{
                            strData: JSON.stringify(dimension)
                        }]
                    })
                })
            }
            request.metadata.add('qlik-tabledescription-bin', tableDescription)
            request.sendMetadata(request.metadata)
            request.write({
                rows
            })
            request.end()
        } catch (error) {
            console.log(error)
        }
    });
}

const getDimensions = async function getDimensions({
    appId,
    commonHeader
}) {
    let session = null
    let dimensions = []
    try {
        session = sessionMgr.getSession(commonHeader);
        global = await session.open()
        doc = await global.openDoc(appId)
        dimensions = await helper.getDimensions(doc)
    } catch (err) {
        dimensions.push('Error: ' + err.toString())
        console.log(err)
    } finally {
        if (session) {
            session = await sessionMgr.closeSession(session)
        }
    }
    return dimensions
}

module.exports = {
    functionDefinition,
    functionConfig
};