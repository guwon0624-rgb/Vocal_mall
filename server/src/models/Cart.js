const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogItem",
      required: [true, "장바구니 상품은 필수입니다."],
    },
    quantity: {
      type: Number,
      required: [true, "상품 수량은 필수입니다."],
      min: [1, "상품 수량은 1개 이상이어야 합니다."],
      validate: {
        validator: Number.isInteger,
        message: "상품 수량은 정수여야 합니다.",
      },
      default: 1,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "장바구니 사용자는 필수입니다."],
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
      validate: {
        validator: (items) => {
          const productIds = items.map(({ product }) => product.toString());

          return new Set(productIds).size === productIds.length;
        },
        message: "같은 상품은 장바구니에 한 번만 담을 수 있습니다.",
      },
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: {
      virtuals: true,
    },
  },
);

cartSchema.virtual("totalQuantity").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

module.exports = mongoose.model("Cart", cartSchema);
