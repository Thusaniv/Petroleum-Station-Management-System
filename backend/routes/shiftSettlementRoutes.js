const express = require('express');
const router = express.Router();
const shiftSettlementController = require('../controllers/shiftSettlementController');

router.get('/', shiftSettlementController.getSettlement);
router.post('/', shiftSettlementController.saveSettlement);

module.exports = router;
