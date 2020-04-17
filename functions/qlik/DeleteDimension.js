const q = require('qlik-sse');
const sessionMgr = require('../../lib/Qlik/QlikSession');
const helper = require('../../lib/Qlik/QlikHelper');

const functionConfig = {
    name: 'DeleteDimension',
    functionType: q.sse.FunctionType.SCALAR,
    returnType: q.sse.DataType.STRING,
    params: [{
        name: 'name',
        dataType: q.sse.DataType.STRING
    }],
}

/**
 * Delete a Dimension by proving its name in app the request was executed in.
 * @function DeleteDimension
 * @param {string} name 
 * @returns {string} status - "Deleted" plus any validation error messages.
 * @example
 * DeleteDimension(dimensionName)
 * @example
 * DeleteDimension('Calendar Date')
 */

const functionDefinition = async function DeleteDimension(request) {
    request.on('data', async (bundle) => {
        try {
            const common = q.sse.CommonRequestHeader.decode(request.metadata.get('qlik-commonrequestheader-bin')[0]);
            const rows = [];
            let result = 0
            for (const row of bundle.rows) {
                let name = row.duals[0].strData
                result = await DoDeleteDimension({
                    name: name,
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
    })
}

const DoDeleteDimension = async function DoDeleteDimension({
    name,
    commonHeader
}) {
    let retVal = 'False'
    let isDesktop = commonHeader.userId == 'Personal\\Me'
    let session = null
    try {
        session = sessionMgr.getSession(commonHeader);
        let deletedDim
        global = await session.open()
        doc = await global.openDoc(commonHeader.appId)
        let dimensionId = await helper.findDimensionByTitle(doc, name)
        if (dimensionId) { // Dimension does not exist
            deletedDim = await doc.destroyDimension(dimensionId)
            retVal = 'Deleted';
        } else { // Dimension doesn't exist return reference
            retVal = `Dimension Not Found ${name}`;
        }
        if (isDesktop) {
            await doc.doSave()
        }
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