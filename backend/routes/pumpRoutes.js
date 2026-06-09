const express = require('express');
const router = express.Router();
const pumpController = require('../controllers/pumpController');

router.get('/', pumpController.getAllPumps);
router.get('/:id', pumpController.getPumpById);
router.post('/', pumpController.createPump);
router.put('/:id', pumpController.updatePump);
router.delete('/:id', pumpController.deletePump);

module.exports = router;
