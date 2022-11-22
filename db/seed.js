const { createAddress, getAddressById } = require("./address");
const { client } = require("./client");
const { createUser } = require("./user");

async function dropTables() {
  try {
    console.log("Starting to drop tables..");
    await client.query(`
    DROP TABLE IF EXISTS cart_item;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS cart;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS address;
    DROP TYPE IF EXISTS purchase_type;
    `);
    console.log("Finished dropping tables");
  } catch (error) {
    console.log("Error dropping tables");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");
    await client.query(` 
    
    CREATE TABLE address(
    id SERIAL PRIMARY KEY,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code INTEGER NOT NULL
   );
    CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      admin BOOLEAN DEFAULT false, 
      address_id INTEGER REFERENCES address(id)
    );
  CREATE TYPE purchase_type AS ENUM ('single','curated','bulk');
    CREATE TABLE products(
      id SERIAL PRIMARY KEY,
      price INTEGER NOT NULL,
      description TEXT NOT NULL,
      audience purchase_type 
    );
    CREATE TABLE cart(
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      active BOOLEAN DEFAULT true
    );
    CREATE TABLE cart_item(
      id SERIAL PRIMARY KEY,
      cart_id INTEGER REFERENCES cart(id),
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER,
      UNIQUE (cart_id, product_id)
   );

    `);
    console.log("Finish building tables");
  } catch (error) {
    console.error("Error building tables");
    throw error;
  }
}

async function buildingDB() {
  try {
    client.connect();
    await dropTables();
    await createTables();
    await createInitialAddress();
    await createInitialUsers();
    // await createInitialProduct()
    // await createInitialCart()
  } catch (error) {
    console.log("error during building");
    throw error;
  }
}

async function createInitialUsers() {
  // const address_id = users.id;
  try {
    console.log("Starting to create users");
    const userAddress = await getAddressById(1);
    console.log(userAddress, "banana");
    await createUser({
      username: "dum-dum",
      password: "ABCD1234",
      name: "dumm-e",
      address_id: userAddress.id,
    });
    console.log("Finished creating users");
  } catch (error) {
    console.error("error creating users");
    throw error;
  }
}

async function createInitialAddress() {
  try {
    console.log("starting to create address");
    await createAddress({
      address_line1: "123 maple street",
      address_line2: "apt 3",
      city: "fort collins",
      state: "colorado",
      zip_code: "80525",
    });
    console.log("finished creating address");
  } catch (error) {
    console.error("error creating address");
    throw error;
  }
}

buildingDB()
  .catch(console.error)
  .finally(() => client.end());
