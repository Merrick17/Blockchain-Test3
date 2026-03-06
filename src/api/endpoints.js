const BASE = '/api';

const ENDPOINTS = {
  CHAIN: `${BASE}/chain`,
  CHAIN_VALID: `${BASE}/chain/valid`,
  TRANSACTIONS: `${BASE}/transactions`,
  WALLETS: `${BASE}/wallets`,
  TRANSACTIONS_PENDING: `${BASE}/transactions/pending`,
  TRANSACTIONS_ALL: `${BASE}/transactions/all`,
  MINE: `${BASE}/mine`,
  STATS: `${BASE}/stats`,
  balance: (address) => `${BASE}/balance/${encodeURIComponent(address)}`,
};

export default ENDPOINTS;
