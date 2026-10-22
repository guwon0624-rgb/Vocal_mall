const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const CatalogItem = require("../models/CatalogItem");
const Order = require("../models/Order");
const User = require("../models/User");

const ADMIN_ROLE = "어드민";
const SHIPPING_FIELDS = [
  "recipientName",
  "phone",
  "postalCode",
  "address1",
  "address2",
  "request",
];
const CANCELLABLE_STATUSES = new Set(["주문접수", "결제완료", "배송준비"]);

const sendOrderError = (error, res, next) => {
  if (error.code === 11000 && error.keyPattern?.orderNumber) {
    return res.status(409).json({
      message: "주문번호가 중복되었습니다. 다시 시도해 주세요.",
      errors: [
        {
          field: "orderNumber",
          message: "주문번호가 중복되었습니다. 다시 시도해 주세요.",
        },
      ],
    });
  }

  if (error.code === 11000 && error.keyPattern?.["payment.paymentId"]) {
    return res.status(409).json({
      message: "이미 처리된 결제입니다.",
      errors: [
        {
          field: "payment.paymentId",
          message: "이미 처리된 결제입니다.",
        },
      ],
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "주문 입력값을 확인해 주세요.",
      errors: Object.values(error.errors).map(({ path, message }) => ({
        field: path,
        message,
      })),
    });
  }

  return next(error);
};

const validateOrderId = (req, res, next, orderId) => {
  if (!mongoose.isObjectIdOrHexString(orderId)) {
    return res.status(400).json({
      message: "올바른 주문 ID가 아닙니다.",
    });
  }

  return next();
};

const loadActor = (userId) => User.findById(userId).select("name email role");

const buildOrderNumber = () => {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `VM-${date}-${suffix}`;
};

const PAYMENT_ID_PATTERN = /^[A-Za-z0-9]{1,40}$/;
const PORTONE_PAYMENT_URL = "https://api.portone.io/payments";
const CARD_METHOD_TYPES = new Set([
  "PaymentMethodCard",
  "PaymentMethodEasyPay",
]);

const parseShippingFee = (value) => {
  if (value === undefined) {
    return 0;
  }

  const shippingFee = Number(value);

  return Number.isInteger(shippingFee) && shippingFee >= 0 ? shippingFee : null;
};

const restoreStock = (items) =>
  Promise.all(
    items.map((item) =>
      CatalogItem.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity } },
      ),
    ),
  );

const takeStock = async (items) => {
  const taken = [];

  for (const item of items) {
    const updated = await CatalogItem.findOneAndUpdate(
      {
        _id: item.product,
        kind: "product",
        isPublished: true,
        stock: { $gte: item.quantity },
      },
      { $inc: { stock: -item.quantity } },
    );

    if (!updated) {
      await restoreStock(taken);
      return false;
    }

    taken.push(item);
  }

  return true;
};

const findVisibleOrder = async (orderId, actor) => {
  const order = await Order.findById(orderId);

  if (!order) {
    return null;
  }

  if (
    actor.role !== ADMIN_ROLE &&
    order.user.toString() !== actor._id.toString()
  ) {
    return null;
  }

  return order;
};

const readPaymentId = (payment) => {
  const paymentId =
    typeof payment?.paymentId === "string" ? payment.paymentId.trim() : "";

  return PAYMENT_ID_PATTERN.test(paymentId) ? paymentId : "";
};

const paymentVerificationError = (status, message) => {
  const error = new Error(message);
  error.status = status;

  return error;
};

const matchesPaymentMethod = (method, methodType) => {
  if (!methodType) {
    return true;
  }

  if (method === "무통장입금") {
    return methodType === "PaymentMethodVirtualAccount";
  }

  return CARD_METHOD_TYPES.has(methodType);
};

const verifyPortonePayment = async (paymentId, { totalAmount, method }) => {
  const apiSecret = process.env.PORTONE_API_SECRET;

  if (!apiSecret) {
    throw paymentVerificationError(503, "결제 검증 설정이 필요합니다.");
  }

  let response;

  try {
    response = await fetch(
      `${PORTONE_PAYMENT_URL}/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `PortOne ${apiSecret}`,
        },
      },
    );
  } catch {
    throw paymentVerificationError(502, "결제 정보를 확인하지 못했습니다.");
  }

  if (response.status === 401 || response.status === 403) {
    throw paymentVerificationError(503, "결제 검증 설정이 올바르지 않습니다.");
  }

  if (response.status === 404) {
    throw paymentVerificationError(400, "결제 내역을 찾을 수 없습니다.");
  }

  if (!response.ok) {
    throw paymentVerificationError(502, "결제 정보를 확인하지 못했습니다.");
  }

  const payment = await response.json();
  const currency = String(
    payment.currency || payment.amount?.currency || "",
  ).replace(/^CURRENCY_/, "");
  const methodType = payment.method?.type || payment.paymentMethod?.type;
  const storeId = process.env.PORTONE_STORE_ID;

  if (payment.id && payment.id !== paymentId) {
    throw paymentVerificationError(400, "결제 번호가 일치하지 않습니다.");
  }

  if (currency !== "KRW") {
    throw paymentVerificationError(400, "결제 통화가 일치하지 않습니다.");
  }

  if (payment.amount?.total !== totalAmount) {
    throw paymentVerificationError(
      400,
      "결제 금액이 주문 금액과 일치하지 않습니다.",
    );
  }

  if (storeId && payment.storeId && payment.storeId !== storeId) {
    throw paymentVerificationError(400, "결제 상점 정보가 일치하지 않습니다.");
  }

  if (!matchesPaymentMethod(method, methodType)) {
    throw paymentVerificationError(400, "결제 수단이 일치하지 않습니다.");
  }

  if (method === "카드" && payment.status !== "PAID") {
    throw paymentVerificationError(400, "카드 결제가 완료되지 않았습니다.");
  }

  if (
    method === "무통장입금" &&
    !["PAID", "VIRTUAL_ACCOUNT_ISSUED"].includes(payment.status)
  ) {
    throw paymentVerificationError(400, "가상계좌 발급이 완료되지 않았습니다.");
  }

  return {
    paid: payment.status === "PAID",
    paidAt: payment.paidAt ? new Date(payment.paidAt) : new Date(),
  };
};

const applyShipping = (order, shipping) => {
  if (!shipping || typeof shipping !== "object") {
    return false;
  }

  SHIPPING_FIELDS.forEach((field) => {
    if (shipping[field] !== undefined) {
      order.shipping[field] = shipping[field];
    }
  });

  return true;
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.auth.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ orders });
  } catch (error) {
    return next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const filter = {};

    if (typeof req.query.status === "string" && req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    return res.status(200).json({ orders });
  } catch (error) {
    return next(error);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const actor = await loadActor(req.auth.id);

    if (!actor) {
      return res.status(401).json({
        message: "유저를 찾을 수 없습니다.",
      });
    }

    const order = await findVisibleOrder(req.params.orderId, actor);

    if (!order) {
      return res.status(404).json({
        message: "주문을 찾을 수 없습니다.",
      });
    }

    return res.status(200).json({ order });
  } catch (error) {
    return next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const actor = await loadActor(req.auth.id);

    if (!actor) {
      return res.status(401).json({
        message: "유저를 찾을 수 없습니다.",
      });
    }

    const shippingFee = parseShippingFee(req.body.shippingFee);

    if (shippingFee === null) {
      return res.status(400).json({
        message: "배송비는 0원 이상의 정수여야 합니다.",
      });
    }

    const paymentId = readPaymentId(req.body.payment);

    if (!paymentId) {
      return res.status(400).json({
        message: "결제 번호를 확인해 주세요.",
        errors: [
          {
            field: "payment.paymentId",
            message: "결제 번호는 영문과 숫자 40자 이하여야 합니다.",
          },
        ],
      });
    }

    const existingOrder = await Order.findOne({
      "payment.paymentId": paymentId,
    });

    if (existingOrder) {
      if (existingOrder.user.toString() !== actor._id.toString()) {
        return res.status(409).json({
          message: "이미 사용된 결제입니다.",
        });
      }

      return res.status(200).json({
        message: "이미 처리된 주문입니다.",
        order: existingOrder,
      });
    }

    const cart = await Cart.findOne({ user: actor._id }).populate({
      path: "items.product",
      select: "sku title price imageUrl stock kind isPublished",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "장바구니가 비어 있습니다.",
      });
    }

    const unavailableItem = cart.items.find(
      (item) =>
        !item.product ||
        item.product.kind !== "product" ||
        !item.product.isPublished,
    );

    if (unavailableItem) {
      return res.status(404).json({
        message: "판매 중인 상품을 찾을 수 없습니다.",
      });
    }

    const items = cart.items.map((item) => ({
      product: item.product._id,
      sku: item.product.sku,
      title: item.product.title,
      imageUrl: item.product.imageUrl,
      price: item.product.price,
      quantity: item.quantity,
    }));
    const itemsTotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    const totalAmount = itemsTotal + shippingFee;
    const method = req.body.payment?.method;

    if (method !== "무통장입금" && method !== "카드") {
      return res.status(400).json({
        message: "결제 수단은 무통장입금 또는 카드여야 합니다.",
      });
    }

    const verifiedPayment = await verifyPortonePayment(paymentId, {
      totalAmount,
      method,
    });
    const order = new Order({
      orderNumber: buildOrderNumber(),
      user: actor._id,
      buyerName: actor.name,
      buyerEmail: actor.email,
      items,
      shipping: req.body.shipping,
      amounts: {
        itemsTotal,
        shippingFee,
        totalAmount,
      },
      payment: {
        paymentId,
        method,
        status: verifiedPayment.paid ? "완료" : "대기",
        ...(verifiedPayment.paid ? { paidAt: verifiedPayment.paidAt } : {}),
      },
      ...(verifiedPayment.paid ? { status: "결제완료" } : {}),
    });

    await order.validate();

    const stockTaken = await takeStock(items);

    if (!stockTaken) {
      return res.status(409).json({
        message: "재고가 부족합니다.",
      });
    }

    try {
      await order.save();
    } catch (error) {
      await restoreStock(items);
      return sendOrderError(error, res, next);
    }

    cart.items = [];

    try {
      await cart.save();
    } catch {
      return res.status(201).json({
        message: "주문을 생성했습니다. 장바구니를 비우지 못했습니다.",
        order,
      });
    }

    return res.status(201).json({
      message: "주문을 생성했습니다.",
      order,
    });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    return sendOrderError(error, res, next);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const actor = await loadActor(req.auth.id);

    if (!actor) {
      return res.status(401).json({
        message: "유저를 찾을 수 없습니다.",
      });
    }

    const order = await findVisibleOrder(req.params.orderId, actor);

    if (!order) {
      return res.status(404).json({
        message: "주문을 찾을 수 없습니다.",
      });
    }

    const isAdmin = actor.role === ADMIN_ROLE;
    let stockRestored = false;

    if (req.body.shipping !== undefined) {
      const canEditShipping =
        isAdmin
          ? !["배송완료", "취소"].includes(order.status)
          : order.status === "주문접수";

      if (!canEditShipping) {
        return res.status(409).json({
          message: "현재 주문 상태에서는 배송 정보를 수정할 수 없습니다.",
        });
      }

      if (!applyShipping(order, req.body.shipping)) {
        return res.status(400).json({
          message: "배송 정보를 확인해 주세요.",
        });
      }
    }

    if (req.body.payment !== undefined || req.body.status !== undefined) {
      if (!isAdmin) {
        return res.status(403).json({
          message: "주문 상태를 변경할 권한이 없습니다.",
        });
      }

      if (req.body.payment?.method !== undefined) {
        order.payment.method = req.body.payment.method;
      }

      if (req.body.payment?.status !== undefined) {
        order.payment.status = req.body.payment.status;

        if (req.body.payment.status === "완료") {
          order.payment.paidAt = req.body.payment.paidAt
            ? new Date(req.body.payment.paidAt)
            : new Date();

          if (order.status === "주문접수") {
            order.status = "결제완료";
          }
        }
      }

      if (req.body.status !== undefined && req.body.status !== order.status) {
        if (order.status === "취소") {
          return res.status(409).json({
            message: "취소된 주문은 상태를 변경할 수 없습니다.",
          });
        }

        if (
          req.body.status === "취소" &&
          !CANCELLABLE_STATUSES.has(order.status)
        ) {
          return res.status(409).json({
            message: "배송이 시작된 주문은 취소할 수 없습니다.",
          });
        }

        if (req.body.status === "취소") {
          await restoreStock(order.items);
          stockRestored = true;
          order.cancelledAt = new Date();

          if (order.payment.status === "완료") {
            order.payment.status = "환불";
          }
        }

        order.status = req.body.status;
      }
    }

    try {
      await order.save();
    } catch (error) {
      if (stockRestored) {
        await takeStock(order.items);
      }

      return sendOrderError(error, res, next);
    }

    return res.status(200).json({
      message: "주문을 수정했습니다.",
      order,
    });
  } catch (error) {
    return sendOrderError(error, res, next);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const actor = await loadActor(req.auth.id);

    if (!actor) {
      return res.status(401).json({
        message: "유저를 찾을 수 없습니다.",
      });
    }

    const order = await findVisibleOrder(req.params.orderId, actor);

    if (!order) {
      return res.status(404).json({
        message: "주문을 찾을 수 없습니다.",
      });
    }

    if (actor.role === ADMIN_ROLE) {
      if (order.status !== "취소") {
        await restoreStock(order.items);
      }

      await order.deleteOne();

      return res.status(200).json({
        message: "주문을 삭제했습니다.",
      });
    }

    if (order.status === "취소") {
      return res.status(409).json({
        message: "이미 취소된 주문입니다.",
      });
    }

    if (!CANCELLABLE_STATUSES.has(order.status)) {
      return res.status(409).json({
        message: "배송이 시작된 주문은 취소할 수 없습니다.",
      });
    }

    if (order.payment.status === "완료") {
      order.payment.status = "환불";
    }

    await restoreStock(order.items);
    order.status = "취소";
    order.cancelledAt = new Date();

    try {
      await order.save();
    } catch (error) {
      await takeStock(order.items);
      return sendOrderError(error, res, next);
    }

    return res.status(200).json({
      message: "주문을 취소했습니다.",
      order,
    });
  } catch (error) {
    return sendOrderError(error, res, next);
  }
};

module.exports = {
  createOrder,
  deleteOrder,
  getAllOrders,
  getMyOrders,
  getOrder,
  updateOrder,
  validateOrderId,
};
