const q = require("qlik-sse");
const sessionMgr = require("../../lib/Qlik/QlikSession");
const helper = require("../../lib/Qlik/QlikHelper");

const functionConfig = {
    name: "GetAppLineage",
    functionType: q.sse.FunctionType.TENSOR,
    returnType: q.sse.DataType.STRING,
    params: [{
        name: "appid",
        dataType: q.sse.DataType.STRING,
    }, ],
};
const tableDescription = q.sse.TableDescription.encode({
    fields: [{
        name: "LineageInfo",
        dataType: q.sse.DataType.STRING,
    }, ],
}).buffer;

/**
 * Gets the lineage information of the app.
 * <br>Current SSE specification requires AppId to be specified as a Field.
 * @function GetAppLineage
 * @param {tabledescription} Tablename{AppId}
 * @returns {string} json qLineage(s)
 * @example
 * TempId:
 * LOAD '\Documents\Qlik\Sense\Apps\Sales Discovery.qvf' as AppId
 * AutoGenerate 1;
 *
 * LoadedMeasures:
 * Load * Extension QCB.GetAppLineage(TempId{AppId});
 */
const functionDefinition = async function LoadLineage(request) {
    request.on("data", async (bundle) => {
        try {
            const common = q.sse.CommonRequestHeader.decode(
                request.metadata.get("qlik-commonrequestheader-bin")[0]
            );
            const rows = [];
            let result = 0;
            for (const row of bundle.rows) {
                let appId = row.duals[0].strData;
                let lineage = await getLineage({
                    appId: appId,
                    commonHeader: common,
                });
                lineage.forEach((record) => {
                    rows.push({
                        duals: [{
                            strData: JSON.stringify(record),
                        }, ],
                    });
                });
            }
            request.metadata.add("qlik-tabledescription-bin", tableDescription);
            request.sendMetadata(request.metadata);
            request.write({
                rows,
            });
            request.end();
        } catch (error) {
            console.log(error);
        }
    });
};

const getLineage = async function getLineage({
    appId,
    commonHeader
}) {
    let session = null;
    let measures = [];
    try {
        session = sessionMgr.getSession(commonHeader);
        global = await session.open();
        doc = await global.openDoc(appId);
        lineage = await helper.getAppLineage(doc);
    } catch (err) {
        lineage.push("Error: " + err.toString());
        console.log(err);
    } finally {
        if (session) {
            session = await sessionMgr.closeSession(session);
        }
    }
    return lineage;
};

module.exports = {
    functionDefinition,
    functionConfig,
};