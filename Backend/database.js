const mysql = require('mysql2/promise');
require('dotenv').config();

 const pool = mysql.createPool({
    host: process.env.MYSQL_ADDON_HOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQL_ADDON_USER || process.env.DB_USER || 'root',
    password: process.env.MYSQL_ADDON_PASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQL_ADDON_DB || process.env.DB_NAME || 'expense_tracker',
    port: process.env.MYSQL_ADDON_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50) NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                category_id INT,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS expenses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                category VARCHAR(100) NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            INSERT IGNORE INTO categories (id, name, type) VALUES 
            (1, 'Food & Dining', 'expense'),
            (2, 'Rent & Housing', 'expense'),
            (3, 'Utilities', 'expense'),
            (4, 'Salary', 'income'),
            (5, 'Freelance', 'income');
        `);

        console.log("Database tables verified and ready!");
    } catch (err) {
        console.error("Failed to initialize database tables:", err);
    }
}

module.exports = {
    pool,
    initDatabase
};