const mongoose = require("mongoose");

const connectDatabase = async () => {
  const atlasUri = process.env.MONGODB_ATLAS_URI?.trim();
  const localUri = process.env.MONGODB_URI?.trim();
  const mongoUri = atlasUri || localUri;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_ATLAS_URI 또는 MONGODB_URI 환경변수가 설정되지 않았습니다.",
    );
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB에 연결되었습니다.");
};

module.exports = connectDatabase;
