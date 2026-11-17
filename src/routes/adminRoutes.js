const router = require("express").Router();
const User = require("../models/User");
const Item = require("../models/Item");
const Claim = require("../models/Claim");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);

router.get("/stats", async (req, res, next) => {
  try {
    const [users, items, lost, found, pendingClaims, returned] = await Promise.all([
      User.countDocuments(), Item.countDocuments(), Item.countDocuments({ type: "lost" }),
      Item.countDocuments({ type: "found" }), Claim.countDocuments({ status: "pending" }),
      Item.countDocuments({ status: "returned" })
    ]);
    res.json({ success: true, stats: { users, items, lost, found, pendingClaims, returned } });
  } catch (err) { next(err); }
});

router.get("/claims", async (req, res, next) => {
  try {
    const claims = await Claim.find().populate("item").populate("claimant", "name email").sort({ createdAt: -1 });
    res.json({ success: true, claims });
  } catch (err) { next(err); }
});

router.patch("/items/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["open", "claimed", "returned", "closed"].includes(status)) return res.status(400).json({ success: false, message: "Invalid item status" });
    const item = await Item.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.json({ success: true, message: "Item status updated", item });
  } catch (err) { next(err); }
});

router.get("/items", async (req, res, next) => {
  try {
    const items = await Item.find().populate("reportedBy", "name email").sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (err) { next(err); }
});

module.exports = router;
