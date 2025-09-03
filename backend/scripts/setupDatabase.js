// This script is for one-time setup of the database.
const path = require('path'); // <-- ADD THIS LINE
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { getDbPool } = require('../src/services/dbPoolManager');

const setupSQL = `
  -- Drop existing tables to start fresh
  DROP TABLE IF EXISTS orders;
  DROP TABLE IF EXISTS customers;

  -- Create the customers table
  CREATE TABLE customers (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(50),
      last_name VARCHAR(50),
      email VARCHAR(100),
      state VARCHAR(50)
  );

  -- Create the orders table
  CREATE TABLE orders (
      order_id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES customers(id),
      order_date DATE,
      amount DECIMAL(10, 2)
  );

  -- Insert sample data into customers
  INSERT INTO customers (first_name, last_name, email, state) VALUES
  ('John', 'Doe', 'john.doe@example.com', 'California'),
  ('Jane', 'Smith', 'jane.smith@example.com', 'New York'),
  ('Peter', 'Jones', 'peter.jones@example.com', 'California'),
  ('Mary', 'Johnson', 'mary.j@example.com', 'Texas');

  -- Insert sample data into orders
  INSERT INTO orders (customer_id, order_date, amount) VALUES
  (1, '2024-08-01', 150.75),
  (2, '2024-08-02', 99.99),
  (1, '2024-08-05', 45.50),
  (3, '2024-08-05', 205.00),
  (4, '2024-08-06', 72.00);
`;

async function setup() {
  console.log('Connecting to the database...');
  const pool = getDbPool('sales_db');
  const client = await pool.connect();
  console.log('Connection successful. Running setup script...');

  try {
    await client.query(setupSQL);
    console.log('✅ Database setup complete. Tables and data created.');
  } catch (err) {
    console.error('❌ Error executing setup script:', err.stack);
  } finally {
    client.release(); // Return the client to the pool
    pool.end(); // Close all connections in the pool
  }
}

setup();