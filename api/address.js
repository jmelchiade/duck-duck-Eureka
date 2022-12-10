const express = require("express");
const addressRouter = express.Router();
const jwt = require("jsonwebtoken");
const {
  createAddress,
  getAddressById,
  updateAddress,
  getAllAddresses,
} = require("../db/address");
const { requireAdmin, requireUser } = require("./utils");

addressRouter.use((req, res, next) => {
  console.log("A request is being made to /address");
  next();
});

addressRouter.post("/", async (req, res, next) => {
  const { address_line1, address_line2, city, state, zip_code } = req.body;
  try {
    const newAddress = await createAddress({
      address_line1,
      address_line2,
      city,
      state,
      zip_code,
    });

    res.send({
      message: "Address has been added!",
      userAddress: newAddress,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

addressRouter.patch("/:address_id", requireUser, async (req, res, next) => {
  try {
    const { address_line1, address_line2, city, state, zip_code } = req.body;
    const id = req.params.address_id;

    const address = await getAddressById(id);

    if (address) {
      {
        const updatedAddress = await updateAddress({
          id,
          address_line1,
          address_line2,
          city,
          state,
          zip_code,
        });
        res.send(updatedAddress);
      }
    }
  } catch (error) {
    console.log(error);
  }
});

addressRouter.get("/", requireAdmin, async (req, res, next) => {
  try {
    const allAddresses = await getAllAddresses();

    res.send(allAddresses);
  } catch ({ name, message, error }) {
    next({ name, message, error });
  }
});

addressRouter.get("/:id", requireUser, async (req, res, next) => {
  const id = req.params.id;
  try {
    const address = await getAddressById(id);
    res.send(address);
  } catch (error) {
    next({ message: "no user by this username" });
  }
});

module.exports = addressRouter;
