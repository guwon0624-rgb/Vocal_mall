require("dotenv").config();
// Vercel은 이 파일에서 express를 불러오는 앱을 Express 서버로 인식합니다.
require("express");

const mongoose = require("mongoose");

const app = require("./src/app");
const ensureReady = require("./src/config/ready");

const port = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    await ensureReady();

    server = app.listen(port, () => {
      console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
    });
  } catch (error) {
    console.error("서버 시작에 실패했습니다.", error);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} 신호를 받아 서버를 종료합니다.`);

  if (server) {
    server.close();
  }

  await mongoose.connection.close();
  process.exit(0);
};

if (process.env.VERCEL) {
  module.exports = app;
} else {
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  startServer();
  module.exports = app;
}
