const express = require("express");
const { rateLimit } = require("express-rate-limit");

const requireAuth = require("../middleware/requireAuth");
const { getCurrentUser, login, logout } = require("../controllers/authController");

const router = express.Router();

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
router.post("/logout", logout);
router.get("/me", requireAuth, getCurrentUser);

module.exports = router;
