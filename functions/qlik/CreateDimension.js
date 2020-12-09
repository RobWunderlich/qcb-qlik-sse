const q = require('qlik-sse');
const sessionMgr = require('../../lib/Qlik/QlikSession');
const helper = require('../../lib/Qlik/QlikHelper');

const functionConfig = {
    name: 'CreateDimension',
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
    ],
}

//Async/Await with forEach
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}


/**
 * Create a Dimension in the calling app.
 * @function CreateDimension
 * @param {string} name 
 * @param {string} definition
 * @param {string} description
 * @param {string} tags
 * @param {string} label
 * @returns {string} status - "Created" or "Replaced" plus any validation error messages.
 * @example
 * Without Grouping: CreateDimension(nameField, defField, descField,tagsField)
 * With Grouping(Hierarchy): CreateDimension(nameField Hierarchy, defListField ,descField,tagsField,labelField)
 * @example
 * Without Grouping :CreateDimension('Country', 'Country',Country of Supplier, 'Sales,Company A')
 * With Grouping(Hierarchy):CreateDimension('Calendar Date Hierarchy', 'Year,Month,Date' , 'Hierarchy Fiscal Year -> Fiscal Period -> Date', 'Time')
 */


const functionDefinition = async function CreateDimension(request) {
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

                result = await DoCreateDimension({
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

const DoCreateDimension = async function DoCreateDimension({
    name,
    def,
    desc,
    tags,
    label,
    commonHeader
}) {
    let retVal = 'False'
    const dimensionDef = {
        qInfo: {
            qType: "dimension"
        },
        qDim: {
            qGrouping: name.toLowerCase().includes("hierarchy") ? "H" : "N",
            qFieldDefs: def.replace(/[\[\]"']/g, "").split(/[,;]+/),
            qFieldLabels: name.toLowerCase().includes("hierarchy") ? [] : [name],
            qLabelExpression: `${label}`,
            title: `${name}`
        },
        qMetaDef: {
            title: `${name}`,
            description: `${desc}`,
            tags: tags.split(/[,;]+/)
        }
    }
    if (desc.trim().startsWith("=")) {
        dimensionDef.qDim.descriptionExpression =  {qStringExpression: {qExpr: `${desc}`}}
    }
    let isDesktop = commonHeader.userId == 'Personal\\Me'
    let session = null
    try {
        session = sessionMgr.getSession(commonHeader);
        let dimension
        global = await session.open()
        doc = await global.openDoc(commonHeader.appId)
        let dimensionId = await helper.findDimensionByTitle(doc, name)
        if (!dimensionId) { // Dimension does not exist
            dimension = await doc.createDimension(dimensionDef)
            retVal = 'Created';
        } else { // Dimension exists, update the properties with the new def
            dimension = await doc.getDimension(dimensionId)
            let prop = await dimension.getProperties()

            prop.qDim.qFieldDefs = def.replace(/[\[\]"']/g, "").split(/[,;]+/)
            prop.qDim.qFieldLabels = prop.qDim.qGrouping == 'H' ? [] : [name]
            prop.qDim.title = name
            prop.qDim.qLabelExpression = label
            prop.qMetaDef.description = desc
            prop.qMetaDef.tags = tags.split(/[,;]+/)

            await dimension.setProperties(prop)
            retVal = 'Replaced';
        }
        // Persist the dimension
        var layout = dimension.getLayout();     // Call getLayout to evaluate DecscriptionExpression
        docprop = await doc.getAppProperties()
        if (docprop.published) {
            await dimension.publish()
            await dimension.approve()
        }
        if (isDesktop) {
            await doc.doSave()
        }

        // Syntax check the dimension and record result
        await (async () => {
            await asyncForEach(dimensionDef.qDim.qFieldDefs, async (element) => {
                let checkValue = await doc.checkExpression(`"${element}"`)
                if (checkValue.qErrorMsg) {
                    retVal += '; ' + checkValue.qErrorMsg
                }
                if (checkValue.qBadFieldNames.length > 0) {
                    retVal += '; Bad field names: ' + checkValue.qBadFieldNames.map((elem) => def.substr(elem.qFrom, elem.qCount)).join(', ')
                }
            })
        })();

        let checkValueLabel = await doc.checkExpression(label)
        if (checkValueLabel.qErrorMsg) {
            retVal += '; ' + checkValueLabel.qErrorMsg
        }
        if (checkValueLabel.qBadFieldNames.length > 0) {
            retVal += '; Bad field names in Label: ' + checkValueLabel.qBadFieldNames.map((elem) => def.substr(elem.qFrom, elem.qCount)).join(', ')
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