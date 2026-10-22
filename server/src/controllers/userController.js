const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");

const DUMMY_PASSWORD_HASH =
  "$2b$12$dVg6t5CP1uS2U34MW.g7d.R.igpBg/Tho67qWGEq99Fi/LWCIXnES";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ADMIN_ROLE = "어드민";

const userFields = [
  "name",
  "activityName",
  "age",
  "email",
  "gender",
  "role",
  "voiceType",
  "goal",
  "referralSource",
];

const pickUserFields = (body) => {
  const fields = userFields.reduce((pickedFields, field) => {
    if (body[field] !== undefined) {
      pickedFields[field] = body[field];
    }

    return pickedFields;
  }, {});

  if (body.agreements !== undefined) {
    fields.agreements = {
      terms: body.agreements?.terms === true,
      privacy: body.agreements?.privacy === true,
      marketing: body.agreements?.marketing === true,
    };
  }

  return fields;
};

const sendValidationError = (error, res, next) => {
  if (error.code === 11000 && error.keyPattern?.email) {
    return res.status(409).json({
      message: "이미 가입된 이메일입니다.",
      errors: [
        {
          field: "email",
          message: "이미 가입된 이메일입니다.",
        },
      ],
    });
  }

  if (error.name !== "ValidationError") {
    return next(error);
  }

  return res.status(400).json({
    message: "입력값을 확인해 주세요.",
    errors: Object.values(error.errors).map(({ path, message }) => ({
      field: path,
      message,
    })),
  });
};

const validateUserId = (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({
      message: "올바른 유저 ID가 아닙니다.",
    });
  }

  return next();
};

const createAccessToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET 환경변수가 설정되지 않았습니다.");
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      issuer: "vocal-mall-api",
      audience: "vocal-mall-client",
    },
  );
};

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

const setAccessTokenCookie = (res, token) => {
  res.cookie("accessToken", token, {
    ...accessTokenCookieOptions,
    maxAge: Number(process.env.JWT_COOKIE_MAX_AGE_MS) || 60 * 60 * 1000,
  });
};

const logout = (req, res) => {
  res.clearCookie("accessToken", accessTokenCookieOptions);

  return res.status(200).json({
    message: "로그아웃되었습니다.",
  });
};

const login = async (req, res, next) => {
  try {
    const email =
      typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password =
      typeof req.body.password === "string" ? req.body.password : "";
    const errors = [];

    if (!email) {
      errors.push({
        field: "email",
        message: "이메일을 입력해 주세요.",
      });
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.push({
        field: "email",
        message: "올바른 이메일 주소를 입력해 주세요.",
      });
    }

    if (!password) {
      errors.push({
        field: "password",
        message: "비밀번호를 입력해 주세요.",
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "이메일과 비밀번호를 확인해 주세요.",
        errors,
      });
    }

    const user = await User.findOne({ email }).select("+password");
    const isPasswordValid = await bcrypt.compare(
      password,
      user?.password || DUMMY_PASSWORD_HASH,
    );

    if (!user || !isPasswordValid) {
      return res.status(401).json({
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const token = createAccessToken(user);
    setAccessTokenCookie(res, token);

    return res.status(200).json({
      message: "로그인되었습니다.",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    return next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    if (req.body.role === ADMIN_ROLE) {
      return res.status(403).json({
        message: "어드민 권한은 회원가입으로 설정할 수 없습니다.",
      });
    }

    const user = await User.create({
      ...pickUserFields(req.body),
      password: req.body.password,
    });

    return res.status(201).json({
      message: "유저가 생성되었습니다.",
      user,
    });
  } catch (error) {
    return sendValidationError(error, res, next);
  }
};

const getUsers = async (req, res) => {
  const filter = ["학생", "코치", "어드민"].includes(req.query.role)
    ? { role: req.query.role }
    : {};
  const users = await User.find(filter).sort({ createdAt: -1 });

  return res.status(200).json({
    count: users.length,
    users,
  });
};

const getCurrentUser = async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.auth?.id)) {
      return res.status(401).json({
        message: "유효하지 않거나 만료된 토큰입니다.",
      });
    }

    const user = await User.findById(req.auth.id);

    if (!user) {
      return res.status(401).json({
        message: "유저를 찾을 수 없습니다.",
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};

const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "유저를 찾을 수 없습니다.",
    });
  }

  return res.status(200).json({ user });
};

const updateUser = async (req, res, next) => {
  try {
    if (req.body.role === ADMIN_ROLE) {
      return res.status(403).json({
        message: "어드민 권한은 이 요청으로 설정할 수 없습니다.",
      });
    }

    const targetUser = await User.findById(req.params.id).select("role");

    if (!targetUser) {
      return res.status(404).json({
        message: "유저를 찾을 수 없습니다.",
      });
    }

    if (targetUser.role === ADMIN_ROLE) {
      return res.status(403).json({
        message: "어드민 계정은 이 요청으로 수정할 수 없습니다.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      pickUserFields(req.body),
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      return res.status(404).json({
        message: "유저를 찾을 수 없습니다.",
      });
    }

    return res.status(200).json({
      message: "유저 정보가 수정되었습니다.",
      user,
    });
  } catch (error) {
    return sendValidationError(error, res, next);
  }
};

const deleteUser = async (req, res) => {
  const targetUser = await User.findById(req.params.id).select("role");

  if (!targetUser) {
    return res.status(404).json({
      message: "유저를 찾을 수 없습니다.",
    });
  }

  if (targetUser.role === ADMIN_ROLE) {
    return res.status(403).json({
      message: "어드민 계정은 이 요청으로 삭제할 수 없습니다.",
    });
  }

  const user = await User.findByIdAndDelete(req.params.id);

  return res.status(200).json({
    message: "유저가 삭제되었습니다.",
  });
};

module.exports = {
  createUser,
  deleteUser,
  getCurrentUser,
  getUser,
  getUsers,
  login,
  logout,
  updateUser,
  validateUserId,
};
