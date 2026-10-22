const express = require("express");

const {
  createOrder,
  deleteOrder,
  getAllOrders,
  getMyOrders,
  getOrder,
  updateOrder,
  validateOrderId,
} = require("../controllers/orderController");
const requireAdmin = require("../middleware/requireAdmin");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getMyOrders).post(createOrder);
router.get("/manage", requireAdmin, getAllOrders);

router.param("orderId", validateOrderId);
router
  .route("/:orderId")
  .get(getOrder)
  .patch(updateOrder)
  .put(updateOrder)
  .delete(deleteOrder);

module.exports = router;
