const express = require("express");

const {
  createCatalogItem,
  deleteCatalogItem,
  getAdminCatalogItems,
  getCatalogItem,
  getCatalogItems,
  updateCatalogItem,
} = require("../controllers/catalogController");
const requireAdmin = require("../middleware/requireAdmin");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
const adminOnly = [requireAuth, requireAdmin];

router.get("/", getCatalogItems);
router.get("/manage", adminOnly, getAdminCatalogItems);
router.get("/:id", getCatalogItem);
router.post("/", adminOnly, createCatalogItem);
router.patch("/:id", adminOnly, updateCatalogItem);
router.delete("/:id", adminOnly, deleteCatalogItem);

module.exports = router;
