// Rename this file to "mailoptions.js" and complete the properties as required
const smtpOptions = {
    // SMTP connection options. See https://nodemailer.com/smtp/
    host: "your.smtp.host",   // Required
    port: 587, 
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: "userid",
      pass: "password"
    }
  }
  const messageDefaults = {
      // Any default properties to be merged into the message. 
      // See: https://nodemailer.com/message/
      //from: 'Sender Name <sender@server.com>',
      //subject: 'No subject given'
  }
module.exports = {
    smtpOptions,
    messageDefaults
}