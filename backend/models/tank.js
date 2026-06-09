const db = require('../config/db');

class Tank {
    static async getAll() {
        const [rows] = await db.query(`
      SELECT t.*, p.name as product_name, p.color_code 
      FROM tanks t
      JOIN products p ON t.product_id = p.id
      ORDER BY t.id ASC
    `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(`
      SELECT t.*, p.name as product_name, p.color_code 
      FROM tanks t
      JOIN products p ON t.product_id = p.id
      WHERE t.id = ?
    `, [id]);
        return rows[0];
    }

    static async create(data) {
        const name = data.name;
        const productId = data.productId || data.product_id;
        const capacity = data.capacity;
        const currentLevel = data.currentLevel || data.current_level || 0;
        const alertLevel = data.alertLevel || data.alert_level;

        const [result] = await db.query(
            'INSERT INTO tanks (name, product_id, capacity, current_level, alert_level) VALUES (?, ?, ?, ?, ?)',
            [name, productId, capacity, currentLevel, alertLevel]
        );
        return this.getById(result.insertId);
    }

    static async update(id, data) {
        const name = data.name;
        const productId = data.productId || data.product_id;
        const capacity = data.capacity;
        const currentLevel = data.currentLevel || data.current_level;
        const alertLevel = data.alertLevel || data.alert_level;

        await db.query(
            'UPDATE tanks SET name = ?, product_id = ?, capacity = ?, current_level = ?, alert_level = ? WHERE id = ?',
            [name, productId, capacity, currentLevel, alertLevel, id]
        );
        return this.getById(id);
    }

    static async delete(id) {
        await db.query('DELETE FROM tanks WHERE id = ?', [id]);
        return true;
    }
}

module.exports = Tank;
