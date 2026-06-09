const PumpReading = require('../models/pumpReading');

exports.getAllReadings = async (req, res) => {
    try {
        const readings = await PumpReading.getAll();
        res.json(readings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createReading = async (req, res) => {
    try {
        const reading = await PumpReading.create(req.body);
        res.status(201).json(reading);
    } catch (err) {
        res.status(500).json({ error: err.message }); // 500 or 400
    }
};

exports.deleteReading = async (req, res) => {
    try {
        await PumpReading.delete(req.params.id);
        res.json({ message: 'Reading deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
