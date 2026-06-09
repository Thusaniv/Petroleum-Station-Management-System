const DailyPrice = require('../models/dailyPrice');

exports.getPriceHistory = async (req, res) => {
    try {
        const history = await DailyPrice.getHistory(req.params.productId);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.setPrice = async (req, res) => {
    try {
        const result = await DailyPrice.setPrice(req.body);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
