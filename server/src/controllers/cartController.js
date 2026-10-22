const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const CatalogItem = require("../models/CatalogItem");

const cartProductFields = [
  "sku",
  "title",
  "price",
  "imageUrl",
  "category",
  "brand",
  "stock",
  "isPublished",
  "kind",
].join(" ");

const populateCart = (cart) =>
  cart.populate({
    path: "items.product",
    select: cartProductFields,
  });

const createEmptyCart = (userId) => ({
  user: userId,
  items: [],
  totalQuantity: 0,
});

const parseQuantity = (value, defaultValue) => {
  const quantity = value === undefined ? defaultValue : Number(value);

  return Number.isInteger(quantity) && quantity >= 1 ? quantity : null;
};

const sendCartError = (error, res, next) => {
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "장바구니 입력값을 확인해 주세요.",
      errors: Object.values(error.errors).map(({ path, message }) => ({
        field: path,
        message,
      })),
    });
  }

  if (error.name === "VersionError") {
    return res.status(409).json({
      message: "장바구니가 변경되었습니다. 새로고침 후 다시 시도해 주세요.",
    });
  }

  return next(error);
};

const validateProductId = (req, res, next, productId) => {
  if (!mongoose.isObjectIdOrHexString(productId)) {
    return res.status(400).json({
      message: "올바른 상품 ID가 아닙니다.",
    });
  }

  return next();
};

const getAvailableProduct = (productId) =>
  CatalogItem.findOne({
    _id: productId,
    kind: "product",
    isPublished: true,
  }).select("stock");

const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.auth.id });

    if (!cart) {
      return res.status(200).json({
        cart: createEmptyCart(req.auth.id),
      });
    }

    await populateCart(cart);

    return res.status(200).json({ cart });
  } catch (error) {
    return next(error);
  }
};

const addCartItem = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!mongoose.isObjectIdOrHexString(productId)) {
      return res.status(400).json({
        message: "올바른 상품 ID가 아닙니다.",
      });
    }

    const quantity = parseQuantity(req.body.quantity, 1);

    if (!quantity) {
      return res.status(400).json({
        message: "상품 수량은 1개 이상의 정수여야 합니다.",
      });
    }

    const product = await getAvailableProduct(productId);

    if (!product) {
      return res.status(404).json({
        message: "판매 중인 상품을 찾을 수 없습니다.",
      });
    }

    let cart = await Cart.findOne({ user: req.auth.id });

    if (!cart) {
      cart = new Cart({
        user: req.auth.id,
        items: [],
      });
    }

    const cartItem = cart.items.find(
      (item) => item.product.toString() === productId,
    );
    const nextQuantity = (cartItem?.quantity || 0) + quantity;

    if (nextQuantity > product.stock) {
      return res.status(409).json({
        message: `재고는 최대 ${product.stock}개까지 담을 수 있습니다.`,
      });
    }

    if (cartItem) {
      cartItem.quantity = nextQuantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await populateCart(cart);

    return res.status(201).json({
      message: "장바구니에 상품을 담았습니다.",
      cart,
    });
  } catch (error) {
    return sendCartError(error, res, next);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const quantity = parseQuantity(req.body.quantity);

    if (!quantity) {
      return res.status(400).json({
        message: "상품 수량은 1개 이상의 정수여야 합니다.",
      });
    }

    const product = await getAvailableProduct(req.params.productId);

    if (!product) {
      return res.status(404).json({
        message: "판매 중인 상품을 찾을 수 없습니다.",
      });
    }

    if (quantity > product.stock) {
      return res.status(409).json({
        message: `재고는 최대 ${product.stock}개까지 선택할 수 있습니다.`,
      });
    }

    const cart = await Cart.findOne({ user: req.auth.id });
    const cartItem = cart?.items.find(
      (item) => item.product.toString() === req.params.productId,
    );

    if (!cartItem) {
      return res.status(404).json({
        message: "장바구니에서 상품을 찾을 수 없습니다.",
      });
    }

    cartItem.quantity = quantity;
    await cart.save();
    await populateCart(cart);

    return res.status(200).json({
      message: "상품 수량을 변경했습니다.",
      cart,
    });
  } catch (error) {
    return sendCartError(error, res, next);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.auth.id });
    const itemIndex = cart?.items.findIndex(
      (item) => item.product.toString() === req.params.productId,
    );

    if (itemIndex === undefined || itemIndex < 0) {
      return res.status(404).json({
        message: "장바구니에서 상품을 찾을 수 없습니다.",
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    await populateCart(cart);

    return res.status(200).json({
      message: "장바구니에서 상품을 삭제했습니다.",
      cart,
    });
  } catch (error) {
    return sendCartError(error, res, next);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.auth.id });

    if (!cart) {
      return res.status(200).json({
        message: "장바구니를 비웠습니다.",
        cart: createEmptyCart(req.auth.id),
      });
    }

    cart.items = [];
    await cart.save();

    return res.status(200).json({
      message: "장바구니를 비웠습니다.",
      cart,
    });
  } catch (error) {
    return sendCartError(error, res, next);
  }
};

module.exports = {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
  validateProductId,
};
