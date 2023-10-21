const express = require('express');
const router = express.Router();
const { createTransaction, getTransactionById, deleteTransaction, getTransactions, updateTransaction } = require('../controllers/transactions.controller');
const { verifyToken } = require('../middlewares/verivyToken');

router.post('/',verifyToken, createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);

module.exports = router;
