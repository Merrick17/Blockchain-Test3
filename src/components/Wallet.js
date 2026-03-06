import React, { useState, useEffect, useCallback } from 'react';
import './Wallet.css';
import { createWallet, fetchBalance } from '../api/blockchain.api';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Wallet component - generates key pairs and displays address and balance.
 * Stores private key in local state. Sent to server only when signing a transaction.
 */
const Wallet = ({ onWalletChange }) => {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [error, setError] = useState('');

  const loadBalance = useCallback(async () => {
    if (!wallet?.publicKey) return;
    try {
      const res = await fetchBalance(wallet.publicKey);
      setBalance(res.data?.balance ?? 0);
    } catch (err) {
      setBalance(0);
    }
  }, [wallet?.publicKey]);

  const handleRefetchBalance = async () => {
    setBalanceLoading(true);
    await loadBalance();
    setBalanceLoading(false);
  };

  const handleCreateWallet = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await createWallet();
      console.log(res);
      const { publicKey, privateKey } = res;
      setWallet({ publicKey, privateKey });
      onWalletChange?.({ publicKey, privateKey });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!wallet?.publicKey) return;
    loadBalance();
    const interval = setInterval(loadBalance, 5000);
    return () => clearInterval(interval);
  }, [wallet?.publicKey, loadBalance]);

  return (
    <div className="wallet-panel">
      <div className="wallet-panel-header">
        <h2 className="panel-title">Wallet</h2>
        {wallet && (
          <button
            type="button"
            className="refetch-balance-button"
            onClick={handleRefetchBalance}
            disabled={balanceLoading}
            title="Refresh balance"
          >
            {balanceLoading ? '…' : '↻'} Refetch Balance
          </button>
        )}
      </div>
      {!wallet ? (
        <>
          <p className="wallet-hint">Create a cryptographic wallet to send transactions.</p>
          <button
            className="create-wallet-button"
            onClick={handleCreateWallet}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Wallet'}
          </button>
        </>
      ) : (
        <div className="wallet-info">
          <div className="wallet-field">
            <span className="wallet-label">Address</span>
            <code className="wallet-address">{wallet.publicKey}</code>
          </div>
          <div className="wallet-field">
            <span className="wallet-label">Balance</span>
            <span className="wallet-balance">{balance != null ? balance : '—'}</span>
          </div>
        </div>
      )}
      {error && <div className="wallet-error">{error}</div>}
    </div>
  );
};

export default Wallet;
