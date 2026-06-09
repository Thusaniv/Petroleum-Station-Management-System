-- =============================================
-- Database Schema for Petroleum Station Management System
-- =============================================

-- 1. Users (Retain for Login)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'cashier') DEFAULT 'cashier',
    full_name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products (Fuel Types)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- e.g., 'Petrol 92', 'Diesel'
    code VARCHAR(20) UNIQUE,   -- e.g., 'LP92', 'LAD'
    color_code VARCHAR(10),    -- For UI badges (e.g., #FF0000)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tanks (Inventory Storage)
CREATE TABLE IF NOT EXISTS tanks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,      -- e.g., 'Tank 1 - Underground'
    product_id INT NOT NULL,
    capacity DECIMAL(10, 2) NOT NULL,
    current_level DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Current Stock
    alert_level DECIMAL(10, 2) DEFAULT 1000,         -- Low stock warning
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 4. Pumps (Dispensing Units / Nozzles)
CREATE TABLE IF NOT EXISTS pumps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pump_name VARCHAR(50) NOT NULL, -- e.g., 'Pump 1 - Nozzle A'
    tank_id INT NOT NULL,           -- Link to source tank
    status ENUM('active', 'maintenance') DEFAULT 'active',
    last_closing_reading DECIMAL(12, 2) DEFAULT 0, -- To auto-populate "Opening Reading"
    location VARCHAR(100),
    FOREIGN KEY (tank_id) REFERENCES tanks(id) ON DELETE CASCADE
);

-- 5. Daily Fuel Prices
CREATE TABLE IF NOT EXISTS daily_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    price_date DATE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (product_id, price_date), -- One price per product per day
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. Pump Readings (Daily / Shift Entries)
CREATE TABLE IF NOT EXISTS pump_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pump_id INT NOT NULL,
    reading_date DATE NOT NULL,
    shift_number INT DEFAULT 1,     -- 1 = Day, 2 = Night (if applicable)
    opening_reading DECIMAL(12, 2) NOT NULL,
    closing_reading DECIMAL(12, 2) NOT NULL,
    testing_qty DECIMAL(10, 2) DEFAULT 0,  -- Calibration/Test qty (Deducted from sales)
    -- Calculated Fields (Can be computed in App, but good to store)
    sales_qty DECIMAL(12, 2) NOT NULL,     -- (Closing - Opening - Testing)
    unit_price DECIMAL(10, 2) NOT NULL,    -- Price at that moment
    total_amount DECIMAL(12, 2) NOT NULL,  -- (Sales Qty * Unit Price
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pump_id) REFERENCES pumps(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Customers (For Credit Sales)
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    vehicle_number VARCHAR(20),
    address TEXT,
    outstanding_balance DECIMAL(12, 2) DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Shift Settlements (Cash / Card / Credit Reconciliation)
CREATE TABLE IF NOT EXISTS shift_settlements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    shift_number INT DEFAULT 1,
    total_sales_amount DECIMAL(12, 2) NOT NULL, -- Sum of all pump sales for this shift
    cash_collected DECIMAL(12, 2) DEFAULT 0,
    card_sales DECIMAL(12, 2) DEFAULT 0,
    credit_sales DECIMAL(12, 2) DEFAULT 0,
    expenses DECIMAL(12, 2) DEFAULT 0, -- Petty cash expenses during shift
    shortage_excess DECIMAL(12, 2) DEFAULT 0, -- (Collected - System Total)
    notes TEXT,
    status ENUM('pending', 'finalized') DEFAULT 'pending',
    finalized_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (date, shift_number),
    FOREIGN KEY (finalized_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 9. Credit Records (Tracking who took credit)
CREATE TABLE IF NOT EXISTS credit_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255),
    settlement_id INT, -- Link to the shift settlement
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (settlement_id) REFERENCES shift_settlements(id) ON DELETE SET NULL
);

-- 10. Payments (Customer paying back credit)
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method ENUM('cash', 'bank_transfer', 'cheque') DEFAULT 'cash',
    reference VARCHAR(100), -- Cheque No / Transfer Ref
    notes TEXT,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
