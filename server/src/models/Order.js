const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogItem",
      required: [true, "주문 상품은 필수입니다."],
    },
    sku: {
      type: String,
      required: [true, "상품 SKU는 필수입니다."],
      trim: true,
      uppercase: true,
      maxlength: [60, "SKU는 60자 이하여야 합니다."],
    },
    title: {
      type: String,
      required: [true, "상품명은 필수입니다."],
      trim: true,
      maxlength: [100, "상품명은 100자 이하여야 합니다."],
    },
    imageUrl: {
      type: String,
      required: [true, "상품 이미지 URL은 필수입니다."],
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
    price: {
      type: Number,
      required: [true, "상품 가격은 필수입니다."],
      min: [0, "상품 가격은 0원 이상이어야 합니다."],
    },
    quantity: {
      type: Number,
      required: [true, "상품 수량은 필수입니다."],
      min: [1, "상품 수량은 1개 이상이어야 합니다."],
      validate: {
        validator: Number.isInteger,
        message: "상품 수량은 정수여야 합니다.",
      },
    },
  },
  {
    _id: false,
  },
);

const shippingSchema = new mongoose.Schema(
  {
    recipientName: {
      type: String,
      required: [true, "받는 사람 이름은 필수입니다."],
      trim: true,
      maxlength: [40, "받는 사람 이름은 40자 이하여야 합니다."],
    },
    phone: {
      type: String,
      required: [true, "연락처는 필수입니다."],
      trim: true,
      maxlength: [20, "연락처는 20자 이하여야 합니다."],
    },
    postalCode: {
      type: String,
      required: [true, "우편번호는 필수입니다."],
      trim: true,
      maxlength: [10, "우편번호는 10자 이하여야 합니다."],
    },
    address1: {
      type: String,
      required: [true, "주소는 필수입니다."],
      trim: true,
      maxlength: [120, "주소는 120자 이하여야 합니다."],
    },
    address2: {
      type: String,
      trim: true,
      maxlength: [120, "상세 주소는 120자 이하여야 합니다."],
      default: "",
    },
    request: {
      type: String,
      trim: true,
      maxlength: [100, "배송 요청사항은 100자 이하여야 합니다."],
      default: "",
    },
  },
  {
    _id: false,
  },
);

const amountsSchema = new mongoose.Schema(
  {
    itemsTotal: {
      type: Number,
      required: [true, "상품 합계는 필수입니다."],
      min: [0, "상품 합계는 0원 이상이어야 합니다."],
    },
    shippingFee: {
      type: Number,
      required: [true, "배송비는 필수입니다."],
      min: [0, "배송비는 0원 이상이어야 합니다."],
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, "결제 금액은 필수입니다."],
      min: [0, "결제 금액은 0원 이상이어야 합니다."],
    },
  },
  {
    _id: false,
  },
);

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      trim: true,
      maxlength: [40, "결제 번호는 40자 이하여야 합니다."],
    },
    method: {
      type: String,
      required: [true, "결제 수단은 필수입니다."],
      enum: {
        values: ["무통장입금", "카드"],
        message: "결제 수단은 무통장입금 또는 카드여야 합니다.",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["대기", "완료", "실패", "환불"],
        message: "결제 상태는 대기, 완료, 실패, 환불 중 하나여야 합니다.",
      },
      default: "대기",
    },
    paidAt: {
      type: Date,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, "주문번호는 필수입니다."],
      trim: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "주문 사용자는 필수입니다."],
      index: true,
    },
    buyerName: {
      type: String,
      required: [true, "주문자 이름은 필수입니다."],
      trim: true,
    },
    buyerEmail: {
      type: String,
      required: [true, "주문자 이메일은 필수입니다."],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "올바른 이메일 주소를 입력해 주세요.",
      ],
    },
    items: {
      type: [orderItemSchema],
      required: [true, "주문 상품은 필수입니다."],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "주문 상품은 1개 이상이어야 합니다.",
      },
    },
    shipping: {
      type: shippingSchema,
      required: [true, "배송 정보는 필수입니다."],
    },
    amounts: {
      type: amountsSchema,
      required: [true, "결제 금액 정보는 필수입니다."],
    },
    payment: {
      type: paymentSchema,
      required: [true, "결제 정보는 필수입니다."],
    },
    status: {
      type: String,
      enum: {
        values: ["주문접수", "결제완료", "배송준비", "배송중", "배송완료", "취소"],
        message:
          "주문 상태는 주문접수, 결제완료, 배송준비, 배송중, 배송완료, 취소 중 하나여야 합니다.",
      },
      default: "주문접수",
      index: true,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index(
  { "payment.paymentId": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "payment.paymentId": { $type: "string" },
    },
  },
);

orderSchema.pre("validate", function () {
  if (!this.amounts || !Array.isArray(this.items)) {
    return;
  }

  const itemsTotal = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  if (this.amounts.itemsTotal !== itemsTotal) {
    this.invalidate(
      "amounts.itemsTotal",
      "상품 합계가 주문 상품 금액과 일치하지 않습니다.",
    );
  }

  if (
    this.amounts.totalAmount !==
    this.amounts.itemsTotal + this.amounts.shippingFee
  ) {
    this.invalidate(
      "amounts.totalAmount",
      "결제 금액은 상품 합계와 배송비의 합이어야 합니다.",
    );
  }
});

module.exports = mongoose.model("Order", orderSchema);
