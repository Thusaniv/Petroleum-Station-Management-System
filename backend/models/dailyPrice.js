const db = require('../config/db');

// Robust date helper
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

class DailyPrice {
    static async getHistory(productId) {
        const [rows] = await db.query(
            'SELECT * FROM daily_prices WHERE product_id = ? ORDER BY price_date DESC',
            [productId]
        );
        return rows.map(r => ({
            ...r,
            priceDate: formatDateToString(r.price_date)
        }));
    }

    // Get Price for specific date and product
    static async getPrice(productId, date) {
        const [rows] = await db.query(
            'SELECT price FROM daily_prices WHERE product_id = ? AND price_date = ?',
            [productId, date]
        );
        return rows[0] ? rows[0].price : null;
    }

    static async setPrice(data) {
        const productId = data.productId || data.product_id;
        const priceDate = data.priceDate || data.price_date;
        const price = data.price;
        // Check if exists
        const existing = await this.getPrice(productId, priceDate);

        if (existing !== null) {
            // Update
            await db.query(
                'UPDATE daily_prices SET price = ? WHERE product_id = ? AND price_date = ?',
                [price, productId, priceDate]
            );
        } else {
            // Insert
            await db.query(
                'INSERT INTO daily_prices (product_id, price_date, price) VALUES (?, ?, ?)',
                [productId, priceDate, price]
            );
        }
        return { productId, priceDate, price };
    }
}

module.exports = DailyPrice;
