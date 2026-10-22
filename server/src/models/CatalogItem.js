const mongoose = require("mongoose");

const catalogItemSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      required: [true, "상품 유형은 필수입니다."],
      enum: {
        values: ["course", "product"],
        message: "상품 유형은 course 또는 product여야 합니다.",
      },
      index: true,
    },
    sku: {
      type: String,
      required: [
        function () {
          return this.kind === "product";
        },
        "상품 SKU는 필수입니다.",
      ],
      trim: true,
      uppercase: true,
      maxlength: [60, "SKU는 60자 이하여야 합니다."],
    },
    title: {
      type: String,
      required: [true, "이름은 필수입니다."],
      trim: true,
      maxlength: [100, "이름은 100자 이하여야 합니다."],
    },
    description: {
      type: String,
      required: [
        function () {
          return this.kind === "course";
        },
        "강의 설명은 필수입니다.",
      ],
      trim: true,
      maxlength: [600, "설명은 600자 이하여야 합니다."],
      default: "",
    },
    price: {
      type: Number,
      required: [true, "가격은 필수입니다."],
      min: [0, "가격은 0원 이상이어야 합니다."],
    },
    imageUrl: {
      type: String,
      required: [true, "이미지 URL은 필수입니다."],
      trim: true,
      validate: {
        validator: (value) => {
          try {
            return new URL(value).protocol === "https:";
          } catch {
            return false;
          }
        },
        message: "이미지 URL은 유효한 HTTPS 주소여야 합니다.",
      },
    },
    imagePublicId: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: [true, "카테고리는 필수입니다."],
      trim: true,
      maxlength: [40, "카테고리는 40자 이하여야 합니다."],
    },
    badge: {
      type: String,
      trim: true,
      maxlength: [30, "배지는 30자 이하여야 합니다."],
      default: "",
    },
    instructor: {
      type: String,
      trim: true,
      maxlength: [50, "강사명은 50자 이하여야 합니다."],
      default: "",
    },
    duration: {
      type: String,
      trim: true,
      maxlength: [50, "강의 기간은 50자 이하여야 합니다."],
      default: "",
    },
    level: {
      type: String,
      trim: true,
      maxlength: [30, "난이도는 30자 이하여야 합니다."],
      default: "",
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [50, "브랜드는 50자 이하여야 합니다."],
      default: "",
    },
    stock: {
      type: Number,
      min: [0, "재고는 0개 이상이어야 합니다."],
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

catalogItemSchema.index({
  kind: 1,
  isPublished: 1,
  featured: -1,
  displayOrder: 1,
});
catalogItemSchema.index({ sku: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("CatalogItem", catalogItemSchema);
