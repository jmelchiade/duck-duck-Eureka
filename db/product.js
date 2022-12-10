const { client } = require("./client");
const { getUser } = require("./user");

async function createProduct({
  name,
  price,
  image_url,
  image_url2,
  author,
  description,
  audience,
}) {
  try {
    const {
      rows: [product],
    } = await client.query(
      `
          INSERT INTO products(name, price, image_url, image_url2, author, description, audience)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *;
        `,
      [name, price, image_url, image_url2, author, description, audience]
    );
    return product;
  } catch (error) {
    throw error;
  }
}

async function getAllProducts() {
  try {
    const { rows: productIds } = await client.query(`
    SELECT id
    FROM products
    `);
    const products = await Promise.all(
      productIds.map((product) => getProductById(product.id))
    );
    return products;
  } catch (error) {
    console.error(error);
  }
}

//get products by audience

async function getProductByAudience(audience) {
  console.log("hello");
  try {
    const { rows: products } = await client.query(
      `
    SELECT *
    FROM products
    WHERE audience = $1
    `,
      [audience]
    );
    console.log("this is getProductByAudience", audience);
    console.log("banana", products);
    return products;
  } catch (error) {
    throw error;
  }
}

async function getProductById(id) {
  try {
    const {
      rows: [product],
    } = await client.query(
      `
    SELECT *
    FROM products
    WHERE id=$1
    `,
      [id]
    );
    if (!product) {
      throw {
        name: "ProductNotFoundError",
        message: "Could not find a product with that id",
      };
    }
    return product;
  } catch (error) {
    console.error(error);
  }
}

async function updateProduct(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [product],
    } = await client.query(
      `
    UPDATE products
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `,
      Object.values(fields)
    );
    console.log(product, "this is product");
    return product;
  } catch (error) {
    throw error;
  }
}

async function destroyProduct(id) {
  const {
    rows: [product],
  } = await client.query(
    `
  DELETE FROM products
  WHERE id = $1
  RETURNING *
  `,
    [id]
  );
  return [product];
}

async function getProductByName(name) {
  try {
    const {
      rows: [products],
    } = await client.query(
      `
    SELECT * FROM products
    WHERE name = $1;
    `,
      [name]
    );
    return products;
  } catch (error) {
    throw error;
  }
}
async function attachProductsToCart(carts) {
  const cartToReturn = { ...carts };
  try {
    const { rows: products } = await client.query(
      `
    SELECT products.*, cart_item.quantity, cart_item.price, cart_item.id AS "cartProductId", cart_item.cart_id
    FROM products
    JOIN cart_item ON cart_item.product_id= products.id
    WHERE cart_item.cart_id IN ($1);
    `,
      [cartToReturn.id]
    );
    cartToReturn.products = products;
    return cartToReturn;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  client,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  destroyProduct,
  getProductByName,
  getProductByAudience,
  attachProductsToCart,
};
