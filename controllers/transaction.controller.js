const { blockchain, Transaction } = require('../models');
const { sendSuccess, sendCreated, sendError } = require('../utils/response');
const {
  isValidAddress,
  isValidAmount,
  isNonEmptyString,
  sanitizeAddress,
  sanitizeAmount,
} = require('../utils/validator');

const addTransaction = (req, res, next) => {
  try {
    const { fromAddress, toAddress, amount, privateKey } = req.body;

    if (!isValidAddress(fromAddress) || !isValidAddress(toAddress)) {
      return sendError(res, 'Invalid wallet address format', 400);
    }

    if (!isValidAmount(amount)) {
      return sendError(res, 'Amount must be a positive number', 400);
    }

    if (!isNonEmptyString(privateKey)) {
      return sendError(res, 'Invalid private key', 400);
    }

    const transaction = new Transaction(
      sanitizeAddress(fromAddress),
      sanitizeAddress(toAddress),
      sanitizeAmount(amount)
    );
    transaction.signTransaction(privateKey);

    blockchain.addTransaction(transaction);

    sendCreated(res, {
      message: 'Transaction added to pending pool',
      transaction,
    });
  } catch (err) {
    next(err);
  }
};

const getPendingTransactions = (req, res) => {
  sendSuccess(res, {
    pendingTransactions: blockchain.pendingTransactions,
    count: blockchain.pendingTransactions.length,
  });
};

const getAllTransactions = (req, res) => {
  const transactions = blockchain.getAllTransactions();
  sendSuccess(res, { transactions, count: transactions.length });
};

module.exports = { addTransaction, getPendingTransactions, getAllTransactions };
