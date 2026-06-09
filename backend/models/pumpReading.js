const db = require('../config/db');

// Helper to format date
const formatDateToString = (dateValue) => {
    if (!dateValue) return null;
    let date;
    if (typeof dateValue === 'string') {
        date = new Date(dateValue + (dateValue.includes('T') || dateValue.includes(' ') ? '' : 'T00:00:00'));
    } else {
        date = dateValue;
    }
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

class PumpReading {
    static async getAll() {
        // Join with Pumps to get names
        const [rows] = await db.query(`
      SELECT pr.*, p.pump_name 
      FROM pump_readings pr
      JOIN pumps p ON pr.pump_id = p.id
      ORDER BY pr.reading_date DESC, pr.id DESC
    `);

        return rows.map(r => this.mapToCamelCase(r));
    }

    static async getById(id) {
        const [rows] = await db.query(`
      SELECT pr.*, p.pump_name 
      FROM pump_readings pr
      JOIN pumps p ON pr.pump_id = p.id
      WHERE pr.id = ?
    `, [id]);
        if (!rows.length) return null;
        return this.mapToCamelCase(rows[0]);
    }

    static async create(data) {
        let { pumpId, readingDate, shiftNumber, openingReading, closingReading, testingQty, createdBy } = data;

        // Ensure numbers
        openingReading = parseFloat(openingReading) || 0;
        closingReading = parseFloat(closingReading) || 0;
        testingQty = parseFloat(testingQty) || 0;

        // 1. Get Pump Details (to find Product)
        const [pumps] = await db.query('SELECT t.product_id FROM pumps p JOIN tanks t ON p.tank_id = t.id WHERE p.id = ?', [pumpId]);
        if (!pumps.length) throw new Error("Pump not found");
        const productId = pumps[0].product_id;

        // 2. Get Fuel Price for that Date
        const [prices] = await db.query('SELECT price FROM daily_prices WHERE product_id = ? AND price_date = ?', [productId, readingDate]);
        if (!prices.length) throw new Error(`No fuel price set for product ${productId} on ${readingDate}`);
        const unitPrice = parseFloat(prices[0].price);

        // 3. Calculate Sales
        const salesQty = closingReading - openingReading - testingQty;
        const totalAmount = salesQty * unitPrice;

        // 4. Insert
        const [result] = await db.query(
            `INSERT INTO pump_readings 
      (pump_id, reading_date, shift_number, opening_reading, closing_reading, testing_qty, sales_qty, unit_price, total_amount, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [pumpId, readingDate, shiftNumber || 1, openingReading, closingReading, testingQty, salesQty, unitPrice, totalAmount, createdBy]
        );

        // 5. Update Pump's "Last Closing Reading" for next day
        await db.query('UPDATE pumps SET last_closing_reading = ? WHERE id = ?', [closingReading, pumpId]);

        // 6. Deduct from Tank (Inventory Management)
        const [pumpInfo] = await db.query("SELECT tank_id FROM pumps WHERE id=?", [pumpId]);
        if (pumpInfo[0]) {
            await db.query("UPDATE tanks SET current_level = current_level - ? WHERE id = ?", [salesQty, pumpInfo[0].tank_id]);
        }

        return this.getById(result.insertId);
    }

    static async delete(id) {
        await db.query('DELETE FROM pump_readings WHERE id = ?', [id]);
        return true;
    }

    static mapToCamelCase(r) {
        return {
            id: r.id,
            pumpId: r.pump_id,
            pumpName: r.pump_name,
            readingDate: formatDateToString(r.reading_date),
            shiftNumber: r.shift_number,
            openingReading: r.opening_reading,
            closingReading: r.closing_reading,
            testingQty: r.testing_qty,
            salesQty: r.sales_qty,
            unitPrice: r.unit_price,
            totalAmount: r.total_amount,
            createdBy: r.created_by,
            createdAt: r.created_at
        };
    }
}

module.exports = PumpReading;
