const crypto = require('crypto');

const decrypter = (encryptedData = '') => {
  const [initializationVectorAsHex, encryptedDataAsHex] = encryptedData?.split(':');
  const initializationVector = Buffer.from(initializationVectorAsHex, 'hex');
  const hashedEncryptionKey = crypto.createHash('sha256').update(process.env.ENCRYPTION_KEY).digest('hex').substring(0, 32);
  const decipher = crypto.createDecipheriv('aes256', hashedEncryptionKey, initializationVector);
  
  let decryptedText = decipher.update(Buffer.from(encryptedDataAsHex, 'hex'));
  decryptedText = Buffer.concat([decryptedText, decipher.final()]);

  return decryptedText.toString();
};

module.exports=decrypter;