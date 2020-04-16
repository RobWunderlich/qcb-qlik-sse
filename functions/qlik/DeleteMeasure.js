const q = require('qlik-sse');
const sessionMgr = require('../../lib/Qlik/QlikSession');
const helper = require('../../lib/Qlik/QlikHelper');

const functionConfig = {
    name: 'DeleteMeasure',
    functionType: q.sse.FunctionType.SCALAR,
    returnType: q.sse.DataType.STRING,
    params: [{
        name: 'name',
        dataType: q.sse.DataType.STRING
    }],
}

/**
 * Delete a Measure by proving its name in the app request was executed in.
 * @function DeleteMeasure
 * @param {string} name 
 * @returns {string} status - "Deleted" plus any validation error messages.
 * @example
 * DeleteMeasure(MeasureName)
 * @example
 * DeleteMeasure('Total Sales')
 */

const functionDefinition = async function DeleteMeasure(request) {
    request.on('data', async (bundle) => {
        try {
            const common = q.sse.CommonRequestHeader.decode(request.metadata.get('qlik-commonrequestheader-bin')[0]);
            const rows = [];
            let result = 0
            for (const row of bundle.rows) {
                let name = row.duals[0].strData
                result = await DoDeleteMeasure({
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

const DoDeleteMeasure = async function DoDeleteMeasure({
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
        let MeasureId = await helper.findMeasureByTitle(doc, name)
        if (MeasureId) { // Measure does not exist
            deletedDim = await doc.destroyMeasure(MeasureId)
            retVal = 'Deleted';
        } else { // Measure doesn't exist return reference
            retVal = `Measure Not Found ${name}`;
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