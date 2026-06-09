const Tank = require('../models/tank');

exports.getAllTanks = async (req, res) => {
    try {
        const tanks = await Tank.getAll();
        res.json(tanks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTankById = async (req, res) => {
    try {
        const tank = await Tank.getById(req.params.id);
        if (!tank) return res.status(404).json({ error: 'Tank not found' });
        res.json(tank);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createTank = async (req, res) => {
    try {
        const tank = await Tank.create(req.body);
        res.status(201).json(tank);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateTank = async (req, res) => {
    try {
        const tank = await Tank.update(req.params.id, req.body);
        res.json(tank);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTank = async (req, res) => {
    try {
        await Tank.delete(req.params.id);
        res.json({ message: 'Tank deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
