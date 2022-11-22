const { client } = require("./client");

async function createAddress({
  address_line1,
  address_line2,
  city,
  state,
  zip_code,
}) {
  try {
    const {
      rows: [address],
    } = await client.query(
      `
        INSERT INTO address(address_line1, address_line2, city, state, zip_code)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;  
        `,
      [address_line1, address_line2, city, state, zip_code]
    );
    return address;
  } catch (error) {
    throw error;
  }
}

async function getAddressById(address_id) {
  try {
    const {
      rows: [address],
    } = await client.query(`
            SELECT *
            FROM address
            WHERE id = ${address_id}
            `);
    if (!address) {
      return null;
    }
    return address;
  } catch (error) {
    throw error;
  }
}

async function updateAddress({ id, ...fields }) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  try {
    if (setString.length > 0) {
      const {
        rows: [address],
      } = await client.query(
        `
            UPDATES address
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
            `,
        Object.values(fields)
      );
      return address;
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createAddress,
  getAddressById,
  updateAddress,
};
