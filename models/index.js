const { Blockchain, Transaction } = require('./blockchain');
const config = require('../config');

const { difficulty, miningReward, initialMinerAddress } = config.blockchain;

const blockchain = new Blockchain(difficulty, miningReward);

if (config.demoData.enabled) {
  config.demoData.transactions.forEach(({ from, to, amount }) => {
    blockchain.addTransaction(new Transaction(from, to, amount));
  });
  blockchain.minePendingTransactions(initialMinerAddress);
}

module.exports = { blockchain, Transaction };
