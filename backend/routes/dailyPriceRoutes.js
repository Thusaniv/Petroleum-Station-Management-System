const express = require('express');
const router = express.Router();
const dailyPriceController = require('../controllers/dailyPriceController');

router.get('/history/:productId', dailyPriceController.getPriceHistory);
router.post('/', dailyPriceController.setPrice);

module.exports = router;
