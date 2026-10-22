const express = require("express");
const { rateLimit } = require("express-rate-limit");

const requireAdmin = require("../middleware/requireAdmin");
const requireAuth = require("../middleware/requireAuth");
const {
  createUser,
  deleteUser,
  getCurrentUser,
  getUser,
  getUsers,
  login,
  updateUser,
  validateUserId,
} = require("../controllers/userController");

const router = express.Router();
const adminOnly = [requireAuth, requireAdmin];

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    message: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.",
  },
});

router.post("/login", loginLimiter, login);
router.get("/me", requireAuth, getCurrentUser);
router.post("/", createUser);

router.param("id", validateUserId);

router.get("/", adminOnly, getUsers);

router
  .route("/:id")
  .get(adminOnly, getUser)
  .patch(adminOnly, updateUser)
  .put(adminOnly, updateUser)
  .delete(adminOnly, deleteUser);

module.exports = router;
