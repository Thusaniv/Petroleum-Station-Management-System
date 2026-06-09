const Pump = require('../models/pump');

exports.getAllPumps = async (req, res) => {
    try {
        const pumps = await Pump.getAll();
        res.json(pumps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPumpById = async (req, res) => {
    try {
        const pump = await Pump.getById(req.params.id);
        if (!pump) return res.status(404).json({ error: 'Pump not found' });
        res.json(pump);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createPump = async (req, res) => {
    try {
        const pump = await Pump.create(req.body);
        res.status(201).json(pump);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updatePump = async (req, res) => {
    try {
        const pump = await Pump.update(req.params.id, req.body);
        res.json(pump);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deletePump = async (req, res) => {
    try {
        await Pump.delete(req.params.id);
        res.json({ message: 'Pump deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
