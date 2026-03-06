const crypto = require('crypto');
const { sendCreated } = require('../utils/response');

/**
 * Generates a new secp256k1 key pair and returns public/private keys as hex strings.
 */
const createWallet = (req, res) => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'secp256k1',
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  });

  sendCreated(res, {
    publicKey: publicKey.toString('hex'),
    privateKey: privateKey.toString('hex'),
  });
};

module.exports = { createWallet };
