const db = require("../config/db");

// Robust: always return YYYY-MM-DD string in local date
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

class Pump {
    static async getAll() {
        const [rows] = await db.query(`
      SELECT p.*, t.name as tank_name, prod.name as product_name
      FROM pumps p
      JOIN tanks t ON p.tank_id = t.id
      JOIN products prod ON t.product_id = prod.id
      ORDER BY p.id ASC
    `);
        // Map snake_case to camelCase for frontend
        return rows.map(row => ({
            ...row,
            lastClosingReading: row.last_closing_reading
        }));
    }

    static async getById(id) {
        const [rows] = await db.query(`
      SELECT p.*, t.name as tank_name, prod.name as product_name
      FROM pumps p
      JOIN tanks t ON p.tank_id = t.id
      JOIN products prod ON t.product_id = prod.id
      WHERE p.id=?
    `, [id]);
        if (!rows[0]) return null;
        return {
            ...rows[0],
            lastClosingReading: rows[0].last_closing_reading
        };
    }

    static async create(data) {
        const pumpName = data.pumpName || data.pump_name;
        const tankId = data.tankId || data.tank_id;
        const status = data.status;
        const location = data.location;
        const lastReading = data.lastClosingReading || 0;

        const [result] = await db.query(
            'INSERT INTO pumps (pump_name, tank_id, status, location, last_closing_reading) VALUES (?, ?, ?, ?, ?)',
            [pumpName, tankId, status || 'active', location, lastReading]
        );
        return this.getById(result.insertId);
    }

    static async update(id, data) {
        const pumpName = data.pumpName || data.pump_name;
        const tankId = data.tankId || data.tank_id;
        const status = data.status;
        const location = data.location;
        const lastReading = data.lastClosingReading;

        const query = lastReading !== undefined
            ? 'UPDATE pumps SET pump_name = ?, tank_id = ?, status = ?, location = ?, last_closing_reading = ? WHERE id = ?'
            : 'UPDATE pumps SET pump_name = ?, tank_id = ?, status = ?, location = ? WHERE id = ?';

        const params = lastReading !== undefined
            ? [pumpName, tankId, status, location, lastReading, id]
            : [pumpName, tankId, status, location, id];

        await db.query(query, params);
        return this.getById(id);
    }

    static async delete(id) {
        await db.query('DELETE FROM pumps WHERE id = ?', [id]);
        return true;
    }
}

module.exports = Pump;
