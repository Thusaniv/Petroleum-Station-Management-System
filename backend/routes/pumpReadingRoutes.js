const express = require('express');
const router = express.Router();
const pumpReadingController = require('../controllers/pumpReadingController');

router.get('/', pumpReadingController.getAllReadings);
router.post('/', pumpReadingController.createReading);
router.delete('/:id', pumpReadingController.deleteReading);

module.exports = router;
