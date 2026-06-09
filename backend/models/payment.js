const db = require('../config/db');


class Payment {
    static async getAll() {
        const [rows] = await db.query(`
            SELECT p.*, c.name as customer_name 
            FROM payments p
            LEFT JOIN customers c ON p.customer_id = c.id
            ORDER BY p.payment_date DESC
        `);
        return rows.map(p => this.mapToCamelCase(p));
    }

    static async create(data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const {
                customerId,
                amount,
                paymentMethod,
                paymentDate,
                reference,
                receivedBy,
                notes
            } = data;

            // Generate receipt number
            const receiptNumber = `RCT-${Date.now()}`;

            // 1. Insert Payment
            const [result] = await connection.query(
                `INSERT INTO payments 
                (receipt_number, customer_id, amount, payment_method, payment_date, reference, received_by, notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [receiptNumber, customerId, amount, paymentMethod, paymentDate, reference, receivedBy, notes]
            );

            // 2. Update Customer Balance (Decrease outstanding balance)
            await connection.query(
                'UPDATE customers SET outstanding_balance = outstanding_balance - ? WHERE id = ?',
                [amount, customerId]
            );

            await connection.commit();
            return this.getById(result.insertId);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        return this.mapToCamelCase(rows[0]);
    }

    static mapToCamelCase(p) {
        return {
            id: p.id,
            receiptNumber: p.receipt_number,
            customerId: p.customer_id,
            customerName: p.customer_name, // Added if joined
            amount: p.amount,
            paymentMethod: p.payment_method,
            paymentDate: p.payment_date,
            reference: p.reference,
            receivedBy: p.received_by,
            notes: p.notes,
            createdAt: p.created_at
        };
    }
}

module.exports = Payment;
