const router = require('express').Router();
const { createWallet } = require('../controllers/wallet.controller');
const { writeLimiter } = require('../middleware/rateLimit.middleware');

router.post('/', writeLimiter, createWallet);

module.exports = router;