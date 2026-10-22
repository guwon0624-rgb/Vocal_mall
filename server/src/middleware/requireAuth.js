const jwt = require("jsonwebtoken");

const getAccessToken = (req) => {
  const header = req.get("authorization");

  if (header?.toLowerCase().startsWith("bearer ")) {
    const token = header.slice(7).trim();

    if (token) {
      return token;
    }
  }

  if (typeof req.cookies?.accessToken === "string" && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }

  return "";
};

const requireAuth = (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    return next(new Error("JWT_SECRET 환경변수가 설정되지 않았습니다."));
  }

  const token = getAccessToken(req);

  if (!token) {
    return res.status(401).json({
      message: "로그인이 필요합니다.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "vocal-mall-api",
      audience: "vocal-mall-client",
    });

    if (typeof payload?.sub !== "string" || !payload.sub) {
      return res.status(401).json({
        message: "유효하지 않거나 만료된 토큰입니다.",
      });
    }

    req.auth = {
      id: payload.sub,
      role: payload.role,
    };

    return next();
  } catch {
    return res.status(401).json({
      message: "유효하지 않거나 만료된 토큰입니다.",
    });
  }
};

module.exports = requireAuth;
