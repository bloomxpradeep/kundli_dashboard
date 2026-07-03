const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const requireAuth = require('../middleware/auth');

router.post('/create-order', requireAuth, paymentController.createOrder);
router.post('/verify', requireAuth, paymentController.verifyPayment);
router.post('/webhook', paymentController.webhook);

module.exports = router;
