const express = require("express");
const {
  getCartItemById,
  destroyItemInCart,
  editCartItem,
} = require("../db/cart_item");
const { requireUser } = require("./utils");
const cart_itemRouter = express.Router();

cart_itemRouter.patch("/:cart_itemId", requireUser, async (req, res, next) => {
  const { cart_itemId } = req.params;
  const { product_id, price, quantity } = req.body;

  const updateFields = {};

  // if (product_id) {
  //   updateFields.product_id = product_id;
  // }
  // if (price) {
  //   updateFields.price = price;
  // }
  if (quantity) {
    updateFields.quantity = quantity;
  }
  try {
    const originalCart = await getCartItemById(product_id);
    if (originalCart && originalCart.id) {
      const updatedCart = await editCartItem(cart_itemId, {
        product_id: originalCart.product_id,
        price: originalCart.price,
        quantity,
      });

      res.send(updatedCart);
    } else {
      next({
        name: "unauthorizedUserError",
        message: `user ${req.user.username} is not allowed to update ${originalCart}
        `,
      });
    }
  } catch (error) {
    throw error;
  }
});

cart_itemRouter.delete("/:cart_itemId", requireUser, async (req, res, next) => {
  const { cart_itemId } = req.params;
  try {
    const deleteCartItem = await destroyItemInCart(cart_itemId);
    console.log("HELLO DELETED", cart_itemId);
    res.send(deleteCartItem);
  } catch ({ name, message }) {
    next({ name, message });
  }
});
module.exports = cart_itemRouter;
