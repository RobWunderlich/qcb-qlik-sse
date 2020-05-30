const nodemailer = require('nodemailer');
const MAIL_NOT_CONFIGURED = 'Error: MailOptions.js not found in SSE'
let options = MAIL_NOT_CONFIGURED
try {
    options = require('./mailOptions');
}
catch (e) {
}

async function sendMail(from, to, subject, text, html) {
    if (options === MAIL_NOT_CONFIGURED) {
        return MAIL_NOT_CONFIGURED
    }
    const message = {
      ...from && {from: from},
      ...to && {to: to},
      ...subject && {subject: subject},
      ...text && {text: text},
      ...html && {html: html},
    };
    
    let transporter = nodemailer.createTransport(options.smtpOptions, options.messageDefaults)
    let response;
    try {
      result = await transporter.sendMail(message)
      response = result.response
    }
    catch (error) {
      console.log(error)
      response = "Error: " + error.message
    }
    return response
}
module.exports = {
    sendMail
}