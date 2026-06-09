const ShiftSettlement = require('../models/shiftSettlement');

exports.getSettlement = async (req, res) => {
    try {
        const { date, shift } = req.query;
        if (!date) return res.status(400).json({ error: 'Date is required' });

        const settlement = await ShiftSettlement.getByDate(date, shift);
        res.json(settlement || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.saveSettlement = async (req, res) => {
    try {
        const result = await ShiftSettlement.createOrUpdate(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
