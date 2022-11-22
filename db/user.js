const { client } = require("./client");

async function createUser({ username, password, name, address_id }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
          INSERT INTO users(username, password, name, address_id)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (username) DO NOTHING
          RETURNING *;
        `,
      [username, password, name, address_id]
    );
    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  createUser,
};
