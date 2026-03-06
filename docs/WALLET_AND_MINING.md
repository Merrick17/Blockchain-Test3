# Wallet & Mining Guide

This document explains how the wallet and balance system works, and how mining rewards are credited to your address.

---

## Overview

- **Wallet**: A cryptographic key pair (secp256k1) used to sign transactions. The public key is your address.
- **Balance**: Calculated by summing all confirmed transactions where your address appears as sender (debited) or recipient (credited).

---

## How Balance Works

Your balance is derived entirely from the blockchain:

- **+amount** when `toAddress` equals your public key (you receive coins)
- **−amount** when `fromAddress` equals your public key (you send coins)

There is no separate balance store; everything comes from transaction history.

---

## Getting Coins

You can receive coins in two ways:

### 1. Mining rewards

When you mine a block, the mining reward (default: 100 coins) is sent to the `miningRewardAddress` in the mine request.

**Behavior:**

- If you have **created a wallet**, mining rewards go to your wallet address.
- If you have **not** created a wallet yet, rewards go to the fallback address `miner1`.

### 2. Transfers

Another wallet can send coins to your address by submitting a signed transaction to the pending pool. Once the block is mined, your balance increases.

---

## Mining with Your Wallet

The app sends your wallet address when you mine:

```javascript
// App.js
await mineBlock(wallet?.publicKey || 'miner1');
```

- `wallet.publicKey` is used when a wallet is selected.
- `'miner1'` is used when no wallet exists.

---

## Quick Start: Building Balance

1. **Create Wallet** – Click “Create Wallet” in the Wallet panel.
2. **Mine Block** – Click “Mine Block” in the Stats panel.
3. **Check Balance** – Your wallet panel shows the updated balance (e.g. 100 after one block).

---

## API Reference

### Create Wallet

```
POST /api/wallets
Response: { publicKey, privateKey }
```

### Get Balance

```
GET /api/balance/:address
Response: { address, balance }
```

### Mine Block

```
POST /api/mine
Body: { "miningRewardAddress": "<your-public-key>" }
Response: { message, latestBlock, chainLength }
```

---

## Technical Notes

- **Key format**: Public and private keys are DER-encoded hex strings (SPKI / PKCS8).
- **Signing**: Transactions are signed with the private key; the public key is never sent to the server until a transaction is signed.
- **Pending transactions**: Mining rewards for pending blocks are only added to the balance after the block is mined and confirmed.
