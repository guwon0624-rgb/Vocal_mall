const { uploadCatalogImage } = require("../services/cloudinaryService");

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "업로드할 이미지 파일을 선택해 주세요.",
      });
    }

    const image = await uploadCatalogImage(req.file.buffer);

    return res.status(201).json({
      message: "이미지가 업로드되었습니다.",
      image,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadImage,
};
