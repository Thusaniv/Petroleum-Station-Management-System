const db = require('../config/db');

class Product {
    static async getAll() {
        const [rows] = await db.query('SELECT * FROM products ORDER BY id ASC');
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { name, code, colorCode } = data;
        const [result] = await db.query(
            'INSERT INTO products (name, code, color_code) VALUES (?, ?, ?)',
            [name, code, colorCode]
        );
        return this.getById(result.insertId);
    }

    static async update(id, data) {
        const { name, code, colorCode } = data;
        await db.query(
            'UPDATE products SET name = ?, code = ?, color_code = ? WHERE id = ?',
            [name, code, colorCode, id]
        );
        return this.getById(id);
    }

    static async delete(id) {
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        return true;
    }
}

module.exports = Product;
