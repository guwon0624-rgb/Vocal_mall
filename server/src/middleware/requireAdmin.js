const User = require("../models/User");

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth?.id).select("role");

    if (!user) {
      return res.status(401).json({
        message: "유저를 찾을 수 없습니다.",
      });
    }

    if (user.role !== "어드민") {
      return res.status(403).json({
        message: "어드민 권한이 필요합니다.",
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = requireAdmin;
