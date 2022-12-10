const { getCartItemsByCart } = require("./cart_item");
const { client } = require("./client");
const { attachProductsToCart } = require("./product");
const { getUserByUsername } = require("./User");

async function createCart(user_id) {
  try {
    const {
      rows: [cart],
    } = await client.query(
      `
      INSERT INTO carts(user_id)
      VALUES($1)
      RETURNING *;
      `,
      [user_id]
    );
    return cart;
  } catch (error) {
    throw error;
  }
}
// will need this function to get all user purchase history for admin
async function getAllCarts() {
  try {
    const { rows } = await client.query(`
    SELECT carts.*,
    users.username AS user_id
    FROM carts
    JOIN users ON users.id = carts.user_id
    `);
    const carts = rows;
    return carts;
  } catch (error) {
    throw error;
  }
}
async function getCartById(id) {
  try {
    const {
      rows: [cart],
    } = await client.query(`
    SELECT *
    FROM carts
    WHERE id=${id}
    `);
    return cart;
  } catch (error) {
    throw error;
  }
}
async function getActiveCartByUser({ username }) {
  try {
    const user = await getUserByUsername(username);
    const userId = user.id;

    const {
      rows: [cart],
    } = await client.query(
      `
    SELECT carts.*, users.username AS user_username
    FROM carts
    JOIN users on users.id=carts.user_id
    WHERE user_id = $1 AND carts.active = true
    `,
      [userId]
    );

    const cartsProducts = await attachProductsToCart(cart);
    return cartsProducts;
  } catch (error) {
    throw error;
  }
}
async function getActiveCartByUserId({ userId }) {
  try {
    const {
      rows: [cart],
    } = await client.query(
      `
    SELECT carts.*, users.username AS user_username
    FROM carts
    JOIN users on users.id=carts.user_id
    WHERE user_id = $1 AND carts.active = true
    `,
      [userId]
    );
    console.log(cart, "The OG CART NO CHANGES ");
    const cartsProducts = await attachProductsToCart(cart);
    console.log(cartsProducts, "potato");
    return cartsProducts;
  } catch (error) {
    throw error;
  }
}
async function getInactiveCartsByUser({ username }) {
  try {
    const user = await getUserByUsername(username);
    const userId = user.id;
    const { rows: carts } = await client.query(
      `
    SELECT carts.*, users.username AS user_username
    FROM carts
    JOIN users on users.id=carts.user_id
    WHERE user_id = $1 AND carts.active = false
    `,
      [userId]
    );
    const cartsProducts = Promise.all(
      carts.map((cart) => {
        return attachProductsToCart(cart);
      })
    );

    return cartsProducts;
  } catch (error) {
    throw error;
  }
}

async function updateCart({ id, fields = {} }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");
  if (setString.length === 0) {
    return;
  }
  try {
    const {
      rows: [cart],
    } = await client.query(
      `
            UPDATE carts
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
            `,
      Object.values(fields)
    );
    return cart;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createCart,
  getCartById,
  getActiveCartByUser,
  getActiveCartByUserId,
  getInactiveCartsByUser,
  getAllCarts,
  updateCart,
};
