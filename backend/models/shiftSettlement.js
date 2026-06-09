const db = require('../config/db');

class ShiftSettlement {
    static async getByDate(date, shiftNumber) {
        const shift = shiftNumber || 1;
        const [rows] = await db.query(
            'SELECT * FROM shift_settlements WHERE date = ? AND shift_number = ?',
            [date, shift]
        );

        if (!rows[0]) return null;

        const settlement = this.mapToCamelCase(rows[0]);

        // Fetch itemized credit records
        const [credits] = await db.query(
            'SELECT customer_id, amount FROM credit_records WHERE settlement_id = ?',
            [settlement.id]
        );

        settlement.creditRecords = credits.map(c => ({
            customerId: c.customer_id,
            amount: c.amount
        }));

        return settlement;
    }

    static async createOrUpdate(data) {
        const { date, shiftNumber, cashCollected, cardSales, creditSales, expenses, notes, finalizedBy, creditRecords } = data;
        const shift = shiftNumber || 1;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Calculate Total System Sales
            const [readings] = await connection.query(
                'SELECT SUM(total_amount) as total FROM pump_readings WHERE reading_date = ? AND shift_number = ?',
                [date, shift]
            );
            const totalSalesAmount = readings[0].total || 0;

            // 2. Calculate Shortage/Excess
            const totalCollected = (Number(cashCollected) || 0) + (Number(cardSales) || 0) + (Number(creditSales) || 0) + (Number(expenses) || 0);
            const shortageExcess = totalCollected - totalSalesAmount;

            let settlementId;

            // 3. Check if exists
            const [existing] = await connection.query(
                'SELECT id FROM shift_settlements WHERE date = ? AND shift_number = ?',
                [date, shift]
            );

            if (existing.length > 0) {
                // Update
                settlementId = existing[0].id;
                await connection.query(`
                    UPDATE shift_settlements 
                    SET total_sales_amount = ?, cash_collected = ?, card_sales = ?, credit_sales = ?, expenses = ?, shortage_excess = ?, notes = ?, status = 'finalized', finalized_by = ?
                    WHERE id = ?`,
                    [totalSalesAmount, cashCollected, cardSales, creditSales, expenses, shortageExcess, notes, finalizedBy, settlementId]
                );

                // Re-sync Credit Records: revert old balances and delete old records
                const [oldCredits] = await connection.query('SELECT customer_id, amount FROM credit_records WHERE settlement_id = ?', [settlementId]);
                for (const old of oldCredits) {
                    await connection.query('UPDATE customers SET outstanding_balance = outstanding_balance - ? WHERE id = ?', [old.amount, old.customer_id]);
                }
                await connection.query('DELETE FROM credit_records WHERE settlement_id = ?', [settlementId]);
            } else {
                // Insert
                const [result] = await connection.query(`
                    INSERT INTO shift_settlements 
                    (date, shift_number, total_sales_amount, cash_collected, card_sales, credit_sales, expenses, shortage_excess, notes, status, finalized_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'finalized', ?)`,
                    [date, shift, totalSalesAmount, cashCollected, cardSales, creditSales, expenses, shortageExcess, notes, finalizedBy]
                );
                settlementId = result.insertId;
            }

            // 4. Process Credit Records
            if (creditRecords && creditRecords.length > 0) {
                for (const record of creditRecords) {
                    if (record.customerId && record.amount) {
                        await connection.query(
                            `INSERT INTO credit_records (customer_id, amount, date, description, settlement_id) VALUES (?, ?, ?, ?, ?)`,
                            [record.customerId, record.amount, date, `Shift ${shift}`, settlementId]
                        );

                        await connection.query(
                            `UPDATE customers SET outstanding_balance = outstanding_balance + ? WHERE id = ?`,
                            [record.amount, record.customerId]
                        );
                    }
                }
            }

            await connection.commit();

            // Return for current date/shift (populated and camelCased)
            // We use static getByDate to avoid repeating mapping logic
            const [rows] = await db.query('SELECT * FROM shift_settlements WHERE id = ?', [settlementId]);
            const finalSettlement = this.mapToCamelCase(rows[0]);
            finalSettlement.creditRecords = creditRecords; // Just echo back for UI
            return finalSettlement;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static mapToCamelCase(s) {
        if (!s) return null;
        return {
            id: s.id,
            date: s.date,
            shiftNumber: s.shift_number,
            totalSalesAmount: s.total_sales_amount,
            cashCollected: s.cash_collected,
            cardSales: s.card_sales,
            creditSales: s.credit_sales,
            expenses: s.expenses,
            shortageExcess: s.shortage_excess,
            notes: s.notes,
            status: s.status,
            finalizedBy: s.finalized_by
        };
    }
}

module.exports = ShiftSettlement;
