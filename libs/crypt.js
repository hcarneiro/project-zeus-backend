const config = require('./config');
const crypto = require('crypto');
const defaultAESAlgorithm = 'aes-256-ctr';

const crypt = {
  aes(algorithm, salt) {
    algorithm = algorithm || defaultAESAlgorithm;
    salt = `${salt || ''}${config.password_salt}`;

    return {
      encrypt(text) {
        const cipher = crypto.createCipher(algorithm, salt);
        let crypted = cipher.update(text.toString(), 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
      },
      decrypt(text) {
        const decipher = crypto.createDecipher(algorithm, salt);
        let dec = decipher.update(text.toString(), 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
      }
    };
  }
};

crypt.salt = function (salt) {
  return crypt.aes(null, salt);
}

module.exports = crypt;
