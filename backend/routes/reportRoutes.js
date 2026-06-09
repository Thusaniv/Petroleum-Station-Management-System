const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');


router.get('/dashboard', reportController.getDashboardStats);
router.get('/customer-summary', reportController.getCustomerSummary);
router.get('/sales', reportController.getDailySales);


module.exports = router;
