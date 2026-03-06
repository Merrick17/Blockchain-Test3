import React, { useState } from 'react';
import './TransactionForm.css';
import { addTransaction } from '../api/blockchain.api';

const TransactionForm = ({ onTransactionAdded, wallet }) => {
  const [formData, setFormData] = useState({ toAddress: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wallet) {
      setMessage('Create a wallet first to send transactions');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      await addTransaction(
        wallet.publicKey,
        formData.toAddress,
        formData.amount,
        wallet.privateKey
      );
      setMessage('Transaction added successfully!');
      setFormData({ toAddress: '', amount: '' });
      onTransactionAdded();
    } catch (err) {
      setMessage(err.response?.data?.error || err.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-form">
      <h2 className="panel-title">Create Transaction</h2>
      {!wallet && (
        <p className="wallet-required">Create a wallet above to send transactions.</p>
      )}
      <form onSubmit={handleSubmit}>
        {wallet && (
          <div className="form-group">
            <label>From Address</label>
            <code className="form-address">{wallet.publicKey}</code>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="toAddress">To Address</label>
          <input
            type="text"
            id="toAddress"
            name="toAddress"
            value={formData.toAddress}
            onChange={handleChange}
            placeholder="Recipient public key (hex)"
            required
            disabled={!wallet}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="e.g., 100"
            step="0.01"
            min="0"
            required
            disabled={!wallet}
          />
        </div>
        
        {message && (
          <div className={`form-message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <button type="submit" className="submit-button" disabled={loading || !wallet}>
          {loading ? 'Adding...' : 'Add Transaction'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
