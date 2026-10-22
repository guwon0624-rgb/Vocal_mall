const express = require("express");
const multer = require("multer");

const { uploadImage } = require("../controllers/uploadController");
const requireAdmin = require("../middleware/requireAdmin");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      const error = new Error("이미지 파일만 업로드할 수 있습니다.");
      error.status = 400;
      callback(error);
      return;
    }

    callback(null, true);
  },
});

router.post(
  "/image",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  uploadImage,
);

module.exports = router;
