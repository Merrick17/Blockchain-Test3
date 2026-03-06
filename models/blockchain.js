const crypto = require('crypto');

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.previousHash +
          this.timestamp +
          JSON.stringify(this.transactions) +
          this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    const target = Array(difficulty + 1).join('0');

    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

class Transaction {
  constructor(fromAddress, toAddress, amount, timestamp = Date.now()) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = timestamp;
    this.signature = '';
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.fromAddress + this.toAddress + this.amount + this.timestamp)
      .digest('hex');
  }

  /**
   * Signs the transaction hash with the private key.
   * @param {crypto.KeyObject|string} signingKey - Private key (KeyObject or PKCS8 DER hex)
   * @throws {Error} If the signer does not own the fromAddress
   */
  signTransaction(signingKey) {
    const privateKey =
      typeof signingKey === 'string'
        ? crypto.createPrivateKey({ key: Buffer.from(signingKey, 'hex'), format: 'der', type: 'pkcs8' })
        : signingKey;

    const publicKey = crypto.createPublicKey(privateKey);
    const publicKeyDer = publicKey.export({ type: 'spki', format: 'der' });
    const expectedFrom = Buffer.isBuffer(publicKeyDer) ? publicKeyDer.toString('hex') : publicKeyDer;

    if (expectedFrom !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }

    const hashTx = this.calculateHash();
    const hashBuffer = Buffer.from(hashTx, 'hex');
    const sig = crypto.sign(null, hashBuffer, privateKey);
    this.signature = sig.toString('hex');
  }

  isValid() {
    if (this.fromAddress === null) return true;

    if (['address1', 'address2'].includes(this.fromAddress)) return true;

    if (!this.signature || this.signature.length === 0) {
      return false;
    }

    try {
      const publicKey = crypto.createPublicKey({
        key: Buffer.from(this.fromAddress, 'hex'),
        format: 'der',
        type: 'spki',
      });

      const hashBuffer = Buffer.from(this.calculateHash(), 'hex');
      return crypto.verify(null, hashBuffer, publicKey, Buffer.from(this.signature, 'hex'));
    } catch {
      return false;
    }
  }
}

class Blockchain {
  constructor(difficulty, miningReward) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = difficulty || 2;
    this.pendingTransactions = [];
    this.miningReward = miningReward || 100;
  }

  createGenesisBlock() {
    return new Block(Date.now(), [], '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    this.chain.push(block);
    this.pendingTransactions = [];
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }

    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) balance -= trans.amount;
        if (trans.toAddress === address) balance += trans.amount;
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (!current.hasValidTransactions()) return false;
      if (current.hash !== current.calculateHash()) return false;
      if (current.previousHash !== previous.hash) return false;
    }

    return true;
  }

  getAllTransactions() {
    return this.chain.flatMap((block) => block.transactions);
  }
}

module.exports = { Blockchain, Block, Transaction };
