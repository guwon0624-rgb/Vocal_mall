const express = require("express");

const {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
  validateProductId,
} = require("../controllers/cartController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);
router.param("productId", validateProductId);

router.route("/").get(getCart).delete(clearCart);
router.post("/items", addCartItem);
router
  .route("/items/:productId")
  .patch(updateCartItem)
  .put(updateCartItem)
  .delete(removeCartItem);

module.exports = router;
