const express = require('express');
const router = express.Router();
const { register, login, authenticate } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/verivyToken');

router.post('/register', register);
router.post('/login', login);
router.get('/authenticate', verifyToken, authenticate);

module.exports = router;
