const e = require("express");
const express = require("express");
const cartRouter = express.Router();
const {
  getAllCarts,
  createCart,
  getActiveCartByUser,
  getInactiveCartsByUser,
  getCartById,
  updateCart,
} = require("../db/cart");
const {
  addItemToCart,
  editCartItem,
  getCartItemById,
  getCartItemsByCart,
} = require("../db/cart_item");
const { attachProductsToCart, getProductById } = require("../db/product");
const { requireUser } = require("./utils");

cartRouter.use((req, res, next) => {
  console.log("A request is being made to /cart");
  next();
});

// GET /api/cart
cartRouter.get("/", async (req, res, next) => {
  try {
    const allCarts = await getAllCarts();
    res.send(allCarts);
  } catch ({ name, message, error }) {
    next({ name, message, error });
  }
});

//GET activeCarts
cartRouter.get("/:username/active", requireUser, async (req, res, next) => {
  let { username } = req.params;
  try {
    const userCart = await getActiveCartByUser({ username });
    res.send(userCart);
  } catch ({ name, message, error }) {
    next({
      name: "noCart",
      message: "Nothing to grab",
      error: `no cart found for ${username}`,
    });
  }
});

//GET inActiveCarts
cartRouter.get("/:username/inactive", requireUser, async (req, res, next) => {
  let { username } = req.params;
  try {
    const userCart = await getInactiveCartsByUser({ username });
    res.send(userCart);
  } catch ({ name, message, error }) {
    next({
      name: "noCart",
      message: "Nothing to grab",
      error: `no inactive carts found for ${username}`,
    });
  }
});
// POST /api/cart
cartRouter.post("/", requireUser, async (req, res, next) => {
  userId = req.user.id;
  const cart = await createCart(userId);
  if (cart) {
    console.log("HERE IS YOUR NEW CART!!!!!!!!!!!!!!!!!");
    res.send(cart);
  } else {
    return null;
  }
});

cartRouter.patch("/:cartId/cart_items", async (req, res, next) => {
  try {
    const cartId = req.params.cartId;
    const cart = await getCartById(cartId);

    if (cart) {
      {
        const updatedCartItems = await attachProductsToCart({
          cart_id,
          product_id,
          price,
          quantity,
        });

        res.send(updatedCartItems);
      }
    }
  } catch (error) {
    console.log(error);
  }
});

cartRouter.patch("/:cartId", async (req, res, next) => {
  const { cartId } = req.params;
  const { active } = req.body;
  const updateFields = {};

  if (active) {
    updateFields.active = active;
  }
  try {
    const originalCart = await getCartById(cartId);

    if (originalCart) {
      const updatedCart = await updateCart({
        id: cartId,
        fields: {
          active,
        },
      });
      res.send(updatedCart);
    } else {
      next({
        name: "cartDoesNotExist",
        message: `cart ${cartId} not found`,
        Error: "cart does not exist",
      });
    }
  } catch ({ name, message, error }) {
    next({ name, message, error });
  }
});

cartRouter.post("/:cartId/product", async (req, res, next) => {
  const { cartId } = req.params;
  console.log("hello", req.params, req.body);
  try {
    const { product_id, price, quantity: inputQuant, addOne } = req.body;
    const cart = await getCartItemsByCart(cartId);
    const bookAlreadyInCart = cart.filter((cartItem) => {
      console.log(cartItem.product_id == product_id);
      return cartItem.product_id == product_id;
    })[0];
    console.log(cart, bookAlreadyInCart, "potato");

    if (cartId && product_id && !bookAlreadyInCart) {
      const cart = {
        cart_id: cartId,
        product_id: product_id,
        price,
        quantity: inputQuant,
      };
      const updatedCartWithProduct = await addItemToCart(cart);
      res.send(updatedCartWithProduct);
    } else if (cartId && product_id && bookAlreadyInCart) {
      console.log("IN THE ELSE IF ");

      const quantityUpdated = await editCartItem(cartId, product_id, {
        quantity: addOne ? bookAlreadyInCart.quantity + 1 : inputQuant,
      });
      console.log(quantityUpdated, "QUANT HERE");
      res.send(quantityUpdated);
    } else {
      next({
        name: "Incomplete Transaction",
        message: "There was an issue adding that item to your cart",
        error: "Incomplete Transaction",
      });
    }
  } catch ({ name, message, error }) {
    next({ name, message, error });
  }
});

module.exports = cartRouter;
