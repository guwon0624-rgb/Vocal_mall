const { v2: cloudinary } = require("cloudinary");

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

const uploadCatalogImage = (buffer) => {
  if (!isCloudinaryConfigured()) {
    const error = new Error(
      "Cloudinary 환경변수가 설정되지 않았습니다.",
    );
    error.status = 503;
    throw error;
  }

  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "vocal-mall/catalog",
        resource_type: "image",
        transformation: [
          {
            width: 1600,
            height: 1600,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          imageUrl: result.secure_url,
          imagePublicId: result.public_id,
        });
      },
    );

    uploadStream.end(buffer);
  });
};

const deleteCatalogImage = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) {
    return;
  }

  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};

module.exports = {
  deleteCatalogImage,
  uploadCatalogImage,
};
