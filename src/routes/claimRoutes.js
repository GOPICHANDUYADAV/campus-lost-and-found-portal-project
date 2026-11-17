const router = require("express").Router();
const Claim = require("../models/Claim");
const Item = require("../models/Item");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/", protect, async (req, res, next) => {
  try {
    const { itemId, message } = req.body;
    if (!itemId || !message || !message.trim()) return res.status(400).json({ success: false, message: "Item ID and claim message are required" });
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    if (String(item.reportedBy) === String(req.user._id)) return res.status(400).json({ success: false, message: "You cannot claim your own listing" });
    if (item.status !== "open") return res.status(400).json({ success: false, message: "This item is no longer open for claims" });
    const existing = await Claim.findOne({ item: itemId, claimant: req.user._id });
    if (existing) return res.status(409).json({ success: false, message: "You have already submitted a claim for this item" });
    const claim = await Claim.create({ item: itemId, claimant: req.user._id, message });
    res.status(201).json({ success: true, message: "Claim submitted", claim });
  } catch (err) { next(err); }
});

router.get("/mine", protect, async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id }).populate("item").sort({ createdAt: -1 });
    res.json({ success: true, claims });
  } catch (err) { next(err); }
});

router.get("/received", protect, async (req, res, next) => {
  try {
    const myItems = await Item.find({ reportedBy: req.user._id }).select("_id");
    const claims = await Claim.find({ item: { $in: myItems.map(x => x._id) } })
      .populate("item").populate("claimant", "name email").sort({ createdAt: -1 });
    res.json({ success: true, claims });
  } catch (err) { next(err); }
});

router.patch("/:id/review", protect, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ success: false, message: "Status must be approved or rejected" });
    const claim = await Claim.findById(req.params.id).populate("item");
    if (!claim) return res.status(404).json({ success: false, message: "Claim not found" });
    const isOwner = String(claim.item.reportedBy) === String(req.user._id);
    if (!isOwner && req.user.role !== "admin") return res.status(403).json({ success: false, message: "Only item owner or admin can review this claim" });
    claim.status = status;
    claim.reviewedBy = req.user._id;
    await claim.save();
    if (status === "approved") {
      claim.item.status = "claimed";
      await claim.item.save();
      await Claim.updateMany({ item: claim.item._id, _id: { $ne: claim._id }, status: "pending" }, { status: "rejected" });
    }
    res.json({ success: true, message: `Claim ${status}`, claim });
  } catch (err) { next(err); }
});

module.exports = router;
