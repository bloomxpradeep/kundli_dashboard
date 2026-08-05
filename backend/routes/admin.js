const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/users/create', requireAuth, requireAdmin, adminController.createUser);
router.put('/users/:id', requireAuth, requireAdmin, adminController.updateUser);
router.delete('/users/:id', requireAuth, requireAdmin, adminController.deleteUser);
router.post('/credits/allocate', requireAuth, requireAdmin, adminController.allocateCredits);
router.get('/dashboard', requireAuth, requireAdmin, adminController.getDashboard);

module.exports = router;
