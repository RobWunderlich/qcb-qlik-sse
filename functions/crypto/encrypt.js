const q = require('qlik-sse');
var crypto = require('crypto');   // node.js crypto package

const functionConfig = {
    name: 'Encrypt',
    functionType: q.sse.FunctionType.SCALAR,
    returnType: q.sse.DataType.STRING,
    params: [
      {
      name: 'plaintext',
      dataType: q.sse.DataType.STRING,
      },
      {
        name: 'passphrase',
        dataType: q.sse.DataType.STRING,
      }
    ],
  }
/**
 * Encrypt a value.
 * @function Encrypt
 * @param {string} plaintext to encrypt.
 * @param {string} passphrase to encrpyt with.
 * @returns {string} encrypted text.
 * @example
 * Encrypt(CreditCard, 'secret phrase')
 */
  const functionDefinition = function Encrypt(request) {
     request.on('data', (bundle) => {
      try {
        const rows = [];
        let result = 0;
        bundle.rows.forEach((row, index) => {
          rows.push({
            duals: [{ strData: EncryptText(row.duals[0].strData, row.duals[1].strData)}]
          });
        }); 
        request.write({
          rows
        });
      }
      catch (error) {
        console.log(error)
      }
  });
}

function EncryptText(text, passphrase) {
  const iv = crypto.randomBytes(16);
  const key = passphrase.padEnd(32)
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let ret = cipher.update(text, 'utf8', 'hex')  
  ret = ret += cipher.final('hex');
  ret = iv.toString('hex') + ret;
  return ret
}

module.exports = {
  functionDefinition,
  functionConfig
};