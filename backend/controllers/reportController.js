const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const connection = await db.getConnection();

        try {
            // 1. Total Daily Sales (Revenue from Pump Readings Today)
            const [todaySalesResult] = await connection.query(`
                SELECT SUM(total_amount) as total 
                FROM pump_readings 
                WHERE reading_date = CURDATE()
            `);
            const todayRevenue = Number(todaySalesResult[0].total || 0);

            // 2. Total Fuel Sold Today (Liters)
            const [todayLitersResult] = await connection.query(`
                SELECT SUM(sales_qty) as total 
                FROM pump_readings 
                WHERE reading_date = CURDATE()
            `);
            const todayLiters = Number(todayLitersResult[0].total || 0);

            // 3. Active Pumps
            const [pumpResult] = await connection.query("SELECT COUNT(*) as count FROM pumps WHERE status = 'active'");
            const activePumps = pumpResult[0].count || 0;

            // 4. Low Stock Tanks
            const [lowStockResult] = await connection.query(`
                SELECT COUNT(*) as count 
                FROM tanks 
                WHERE current_level <= alert_level
            `);
            const lowStockTanks = lowStockResult[0].count || 0;

            // 5. Monthly Revenue (Last 6 Months)
            const [monthlyResult] = await connection.query(`
                SELECT 
                    DATE_FORMAT(reading_date, '%Y-%m') as month_key,
                    SUM(total_amount) as total
                FROM pump_readings 
                WHERE reading_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY month_key
                ORDER BY month_key DESC
            `);

            const monthlyRevenue = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthName = d.toLocaleString('default', { month: 'short' });
                const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

                const found = monthlyResult.find(r => r.month_key === monthKey);
                monthlyRevenue.push({
                    month: monthName,
                    revenue: found ? Number(found.total) : 0
                });
            }

            // 6. Recent Sales (Last 5 Pump Readings)
            const [recentSales] = await connection.query(`
                SELECT 
                    pr.id, 
                    pr.reading_date, 
                    p.pump_name, 
                    pr.sales_qty, 
                    pr.total_amount
                FROM pump_readings pr
                JOIN pumps p ON pr.pump_id = p.id
                ORDER BY pr.created_at DESC
                LIMIT 5
            `);

            res.json({
                todayRevenue,
                todayLiters,
                activePumps,
                lowStockTanks,
                monthlyRevenue,
                recentSales
            });

        } finally {
            connection.release();
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

exports.getCustomerSummary = async (req, res) => {
    const { customerId } = req.query;

    if (!customerId) {
        return res.status(400).json({ error: 'Customer ID is required' });
    }

    try {
        const connection = await db.getConnection();

        try {
            // 1. Customer Details
            const [customerResult] = await connection.query(`
                SELECT * FROM customers WHERE id = ?
            `, [customerId]);

            if (customerResult.length === 0) {
                return res.status(404).json({ error: 'Customer not found' });
            }
            const customer = customerResult[0];

            // 2. Financial Summary (Total Credit vs Total Paid)
            const [creditRes] = await connection.query(`
                SELECT SUM(amount) as total FROM credit_records WHERE customer_id = ?
            `, [customerId]);
            const totalCredit = Number(creditRes[0].total || 0);

            const [paidRes] = await connection.query(`
                SELECT SUM(amount) as total FROM payments WHERE customer_id = ?
            `, [customerId]);
            const totalPaid = Number(paidRes[0].total || 0);

            // 3. Recent Credit Transactions
            const [recentCredit] = await connection.query(`
                SELECT * FROM credit_records WHERE customer_id = ? ORDER BY date DESC LIMIT 10
            `, [customerId]);

            // 4. Recent Payments
            const [recentPayments] = await connection.query(`
                SELECT * FROM payments WHERE customer_id = ? ORDER BY payment_date DESC LIMIT 10
            `, [customerId]);

            res.json({
                profile: customer,
                financials: {
                    totalCredit,
                    totalPaid,
                    outstandingBalance: Number(customer.outstanding_balance)
                },
                history: {
                    credits: recentCredit,
                    payments: recentPayments
                }
            });

        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error fetching customer summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getDailySales = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const [rows] = await db.query(`
            SELECT 
                pr.reading_date,
                p.pump_name,
                prod.name as product_name,
                pr.sales_qty,
                pr.unit_price,
                pr.total_amount
            FROM pump_readings pr
            JOIN pumps p ON pr.pump_id = p.id
            JOIN tanks t ON p.tank_id = t.id
            JOIN products prod ON t.product_id = prod.id
            WHERE pr.reading_date BETWEEN ? AND ?
            ORDER BY pr.reading_date DESC
        `, [startDate, endDate]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
