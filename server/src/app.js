const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const ensureReady = require("./config/ready");
const authRouter = require("./routes/auth");
const cartRouter = require("./routes/cart");
const catalogRouter = require("./routes/catalog");
const orderRouter = require("./routes/orders");
const uploadRouter = require("./routes/uploads");
const userRouter = require("./routes/users");

const clientOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.use((req, res, next) => {
  ensureReady().then(() => next()).catch(next);
});
app.use(helmet());
app.use(
  cors({
    origin: clientOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Vocal Mall API가 정상적으로 동작 중입니다.",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/orders", orderRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/users", userRouter);

app.use((req, res) => {
  res.status(404).json({ message: "요청한 경로를 찾을 수 없습니다." });
});

app.use((error, req, res, next) => {
  console.error(error);

  const isUploadError = error.name === "MulterError";
  const message =
    error.code === "LIMIT_FILE_SIZE"
      ? "이미지는 5MB 이하여야 합니다."
      : error.message;

  res.status(error.status || (isUploadError ? 400 : 500)).json({
    message:
      message || "서버에서 요청을 처리하는 중 오류가 발생했습니다.",
  });
});

module.exports = app;
