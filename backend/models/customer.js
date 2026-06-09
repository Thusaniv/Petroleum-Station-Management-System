const db = require("../config/db");

class Customer {
    static async getAll() {
        const [rows] = await db.query("SELECT * FROM customers ORDER BY id DESC");
        return rows.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            vehicleNumber: c.vehicle_number,
            address: c.address,
            outstandingBalance: Number(c.outstanding_balance),
            status: c.status,
            createdAt: c.created_at
        }));
    }

    static async getById(id) {
        const [rows] = await db.query("SELECT * FROM customers WHERE id = ?", [id]);
        if (!rows.length) return null;
        const c = rows[0];
        return {
            id: c.id,
            name: c.name,
            phone: c.phone,
            vehicleNumber: c.vehicle_number,
            address: c.address,
            outstandingBalance: Number(c.outstanding_balance),
            status: c.status,
            createdAt: c.created_at
        };
    }

    static async create(data) {
        const name = data.name;
        const phone = data.phone;
        const vehicleNumber = data.vehicleNumber || data.vehicle_number;
        const address = data.address;
        const status = data.status || 'active';

        const [result] = await db.query(
            "INSERT INTO customers (name, phone, vehicle_number, address, status, outstanding_balance) VALUES (?, ?, ?, ?, ?, 0)",
            [name, phone, vehicleNumber, address, status]
        );
        return await this.getById(result.insertId);
    }

    static async update(id, data) {
        const name = data.name;
        const phone = data.phone;
        const vehicleNumber = data.vehicleNumber || data.vehicle_number;
        const address = data.address;
        const status = data.status;

        await db.query(
            "UPDATE customers SET name = ?, phone = ?, vehicle_number = ?, address = ?, status = ? WHERE id = ?",
            [name, phone, vehicleNumber, address, status, id]
        );
        return await this.getById(id);
    }

    static async delete(id) {
        return db.query("DELETE FROM customers WHERE id = ?", [id]);
    }
}

module.exports = Customer;