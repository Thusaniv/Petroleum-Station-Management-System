-- =============================================
-- Seed Data for Petroleum Station Management System
-- =============================================

-- Disable foreign key checks to avoid ordering issues during bulk insert
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data (Optional: Remove if you want to append)
TRUNCATE TABLE payment_cancellations; -- Check if exists, otherwise ignore
TRUNCATE TABLE payments;
TRUNCATE TABLE credit_records;
TRUNCATE TABLE shift_settlements;
TRUNCATE TABLE pump_readings;
TRUNCATE TABLE daily_prices;
TRUNCATE TABLE pumps;
TRUNCATE TABLE tanks;
TRUNCATE TABLE products;
TRUNCATE TABLE customers;

-- 1. Products
INSERT INTO products (id, name, code, color_code) VALUES
(1, 'Petrol 92 Octane', 'LP92', '#FF4136'),
(2, 'Petrol 95 Octane', 'LP95', '#FF851B'),
(3, 'Auto Diesel', 'LAD', '#FFDC00'),
(4, 'Super Diesel', 'LSD', '#0074D9'),
(5, 'Kerosene', 'LK', '#B10DC9');

-- 2. Tanks
INSERT INTO tanks (id, name, product_id, capacity, current_level, alert_level) VALUES
(1, 'Tank 1 (92)', 1, 13500.00, 8500.00, 2000.00),
(2, 'Tank 2 (95)', 2, 9000.00, 4500.00, 1000.00),
(3, 'Tank 3 (Diesel)', 3, 20000.00, 12000.00, 3000.00),
(4, 'Tank 4 (S. Diesel)', 4, 13500.00, 6000.00, 2000.00);

-- 3. Pumps
INSERT INTO pumps (id, pump_name, tank_id, status, last_closing_reading, location) VALUES
(1, 'Pump 1 (92)', 1, 'active', 150450.00, 'Island 1 - Side A'),
(2, 'Pump 2 (92)', 1, 'active', 148200.00, 'Island 1 - Side B'),
(3, 'Pump 3 (Diesel)', 3, 'active', 289000.00, 'Island 2 - Side A'),
(4, 'Pump 4 (S. Diesel)', 4, 'active', 56000.00, 'Island 2 - Side B');

-- 4. Daily Fuel Prices
INSERT INTO daily_prices (product_id, price_date, price) VALUES
(1, CURDATE(), 371.00),
(2, CURDATE(), 420.00),
(3, CURDATE(), 363.00),
(4, CURDATE(), 458.00),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 371.00),
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 363.00);

-- 5. Customers (Credit Customers)
INSERT INTO customers (id, name, phone, vehicle_number, address, status, outstanding_balance) VALUES
(1, 'ABC Logistics', '0771234567', 'WP LG-1001', '123 Main Rd, Colombo', 'active', 45000.00),
(2, 'City Cab Service', '0719876543', 'WP CB-8890', '45 Temple St, Kandy', 'active', 12500.00),
(3, 'Global Construction', '0112345678', 'WP CN-5544', '89 Industrial Zone', 'active', 89000.00);

-- 6. Pump Readings (Last 3 Days)
-- Day 1 (2 days ago)
INSERT INTO pump_readings (pump_id, reading_date, opening_reading, closing_reading, sales_qty, unit_price, total_amount) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 149000.00, 149500.00, 500.00, 371.00, 185500.00), -- Pump 1
(3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 287000.00, 288000.00, 1000.00, 363.00, 363000.00); -- Pump 3 (Diesel)

-- Day 2 (Yesterday)
INSERT INTO pump_readings (pump_id, reading_date, opening_reading, closing_reading, sales_qty, unit_price, total_amount) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 149500.00, 150000.00, 500.00, 371.00, 185500.00),
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 288000.00, 288500.00, 500.00, 363.00, 181500.00);

-- Day 3 (Today)
INSERT INTO pump_readings (pump_id, reading_date, opening_reading, closing_reading, sales_qty, unit_price, total_amount) VALUES
(1, CURDATE(), 150000.00, 150450.00, 450.00, 371.00, 166950.00),
(3, CURDATE(), 288500.00, 289000.00, 500.00, 363.00, 181500.00);

-- 7. Credit Records
INSERT INTO credit_records (customer_id, date, amount, description) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 50000.00, 'Fuel allowence Jan'),
(2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 12500.00, 'Full tank diesel'),
(3, CURDATE(), 89000.00, 'Monthly bulk diesel');

-- 8. Payments
INSERT INTO payments (customer_id, payment_date, amount, method, reference) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 5000.00, 'bank_transfer', 'REF123456');

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- End of Seed Script
-- =============================================
