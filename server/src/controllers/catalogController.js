const mongoose = require("mongoose");

const CatalogItem = require("../models/CatalogItem");
const {
  deleteCatalogImage,
} = require("../services/cloudinaryService");

const catalogFields = [
  "kind",
  "sku",
  "title",
  "description",
  "price",
  "imageUrl",
  "imagePublicId",
  "category",
  "badge",
  "instructor",
  "duration",
  "level",
  "brand",
  "specs",
  "sourceUrl",
  "stock",
  "featured",
  "isPublished",
  "displayOrder",
];

const pickCatalogFields = (body) =>
  catalogFields.reduce((fields, field) => {
    if (body[field] !== undefined) {
      fields[field] = body[field];
    }

    return fields;
  }, {});

const sendCatalogError = (error, res, next) => {
  if (error.code === 11000 && error.keyPattern?.sku) {
    return res.status(409).json({
      message: "이미 사용 중인 SKU입니다.",
      errors: [
        {
          field: "sku",
          message: "이미 사용 중인 SKU입니다.",
        },
      ],
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "입력값을 확인해 주세요.",
      errors: Object.values(error.errors).map(({ path, message }) => ({
        field: path,
        message,
      })),
    });
  }

  return next(error);
};

const getKindFilter = (kind) =>
  ["course", "product"].includes(kind) ? { kind } : {};

const getCatalogItems = async (req, res, next) => {
  try {
    const items = await CatalogItem.find({
      ...getKindFilter(req.query.kind),
      isPublished: true,
    }).sort({ featured: -1, displayOrder: 1, createdAt: -1 });

    return res.status(200).json({
      count: items.length,
      items,
    });
  } catch (error) {
    return next(error);
  }
};

const getCatalogItem = async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({
        message: "올바른 항목 ID가 아닙니다.",
      });
    }

    const item = await CatalogItem.findOne({
      _id: req.params.id,
      isPublished: true,
    });

    if (!item) {
      return res.status(404).json({
        message: "항목을 찾을 수 없습니다.",
      });
    }

    return res.status(200).json({ item });
  } catch (error) {
    return next(error);
  }
};

const getAdminCatalogItems = async (req, res, next) => {
  try {
    const items = await CatalogItem.find(
      getKindFilter(req.query.kind),
    ).sort({ kind: 1, displayOrder: 1, createdAt: -1 });

    return res.status(200).json({
      count: items.length,
      items,
    });
  } catch (error) {
    return next(error);
  }
};

const createCatalogItem = async (req, res, next) => {
  try {
    const item = await CatalogItem.create(pickCatalogFields(req.body));

    return res.status(201).json({
      message: "등록되었습니다.",
      item,
    });
  } catch (error) {
    return sendCatalogError(error, res, next);
  }
};

const updateCatalogItem = async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({
        message: "올바른 항목 ID가 아닙니다.",
      });
    }

    const previousItem = await CatalogItem.findById(req.params.id);

    if (!previousItem) {
      return res.status(404).json({
        message: "항목을 찾을 수 없습니다.",
      });
    }

    const item = await CatalogItem.findByIdAndUpdate(
      req.params.id,
      pickCatalogFields(req.body),
      {
        new: true,
        runValidators: true,
      },
    );

    if (
      previousItem.imagePublicId &&
      previousItem.imagePublicId !== item.imagePublicId
    ) {
      deleteCatalogImage(previousItem.imagePublicId).catch(console.error);
    }

    return res.status(200).json({
      message: "수정되었습니다.",
      item,
    });
  } catch (error) {
    return sendCatalogError(error, res, next);
  }
};

const deleteCatalogItem = async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({
        message: "올바른 항목 ID가 아닙니다.",
      });
    }

    const item = await CatalogItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "항목을 찾을 수 없습니다.",
      });
    }

    if (item.imagePublicId) {
      deleteCatalogImage(item.imagePublicId).catch(console.error);
    }

    return res.status(200).json({
      message: "삭제되었습니다.",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createCatalogItem,
  deleteCatalogItem,
  getAdminCatalogItems,
  getCatalogItem,
  getCatalogItems,
  updateCatalogItem,
};
