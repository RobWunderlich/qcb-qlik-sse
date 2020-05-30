const q = require('qlik-sse');
const mailer = require('../../lib/mail/mailer');

const functionConfig = {
    name: 'SendMail',
    functionType: q.sse.FunctionType.SCALAR,
    returnType: q.sse.DataType.STRING,
    params: [
      {
      name: 'from',
      dataType: q.sse.DataType.STRING,
      },
      {
      name: 'to',
      dataType: q.sse.DataType.STRING,
      },
      {
      name: 'subject',
      dataType: q.sse.DataType.STRING,
      },
      {
      name: 'text',
      dataType: q.sse.DataType.STRING,
      },
      {
      name: 'html',
      dataType: q.sse.DataType.STRING,
      }      
    ],
  }
/**
 * Send an email
 * @function SendMail
 * @param {string} fromAddress
 * @param {string} toAddress
 * @param {string} subject
 * @param {string} text - text version of message
 * @param {string} html - hteml version of message. Empty string if no html version.
 * @returns {string} status
 * @example
 * let status = QCB.SendMail('admin@qlikaroo.com', 'someuser@qlikaroo.com', 'Reload Completed',
	'Reload of "' & DocumentTitle() & '" completed at ' & Now(1));
 */
  const functionDefinition = async function SendMail(request) {
    request.on('data', async (bundle) => {
      try {
        const rows = [];
        for (const row of bundle.rows) {
          let result = await DoMail(
            row.duals[0].strData,
            row.duals[1].strData,
            row.duals[2].strData,
            row.duals[3].strData,
            row.duals[4].strData
          )
          rows.push({
            duals: [{ strData: result }]
          });
        }; 
        request.write({
          rows
        });
        request.end()
      }
      catch (error) {
        console.log(error)
        request.end()
      }
  });
}

async function DoMail(from, to, subject, text, html) {
  return await mailer.sendMail(from, to, subject, text, html)
}

module.exports = {
  functionDefinition,
  functionConfig
};