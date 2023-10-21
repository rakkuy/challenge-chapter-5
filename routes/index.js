const express = require('express');
const router = express.Router();

router.use('/users', require('./users.route'));
router.use('/accounts', require('./accounts.route'));
router.use('/transactions', require('./transactions.route'));
router.use('/auth', require('./auth.route'));

module.exports = router;
