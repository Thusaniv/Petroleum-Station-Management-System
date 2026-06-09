const Payment = require('../models/payment');

exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.getAll();
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPayment = async (req, res) => {
    try {
        const payment = await Payment.create(req.body);
        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
