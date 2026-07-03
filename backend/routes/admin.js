const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const requireAuth = require('../middleware/auth');

router.post('/users/create', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/credits/allocate', adminController.allocateCredits);
router.get('/dashboard', requireAuth, adminController.getDashboard);

module.exports = router;
