const router = require("express").Router();
const Item = require("../models/Item");
const Claim = require("../models/Claim");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", async (req, res, next) => {
  try {
    const { q, category, location, type, sort = "newest", status = "open" } = req.query;
    const filter = {};
    if (status !== "all") filter.status = status;
    if (type && ["lost", "found"].includes(type)) filter.type = type;
    if (category) filter.category = new RegExp(category, "i");
    if (location) filter.location = new RegExp(location, "i");
    if (q) filter.$or = [
      { title: new RegExp(q, "i") },
      { description: new RegExp(q, "i") },
      { location: new RegExp(q, "i") }
    ];
    const sortOption = sort === "oldest" ? { itemDate: 1 } : { itemDate: -1 };
    const items = await Item.find(filter).populate("reportedBy", "name").sort(sortOption);
    res.json({ success: true, count: items.length, items });
  } catch (err) { next(err); }
});

router.get("/mine", protect, async (req, res, next) => {
  try {
    const items = await Item.find({ reportedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (err) { next(err); }
});

router.post("/", protect, upload.single("image"), async (req, res, next) => {
  try {
    const { title, type, category, description, location, itemDate } = req.body;
    if (!title || !type || !category || !description || !location || !itemDate) {
      return res.status(400).json({ success: false, message: "All fields except image are required" });
    }
    if (!["lost", "found"].includes(type)) return res.status(400).json({ success: false, message: "Type must be lost or found" });
    const item = await Item.create({
      title, type, category, description, location, itemDate,
      image: req.file ? `/uploads/${req.file.filename}` : "",
      reportedBy: req.user._id
    });
    res.status(201).json({ success: true, message: "Item report created", item });
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate("reportedBy", "name email");
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.json({ success: true, item });
  } catch (err) { next(err); }
});

router.patch("/:id", protect, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    if (String(item.reportedBy) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You cannot edit this item" });
    }
    const allowed = ["title", "category", "description", "location", "itemDate", "status"];
    allowed.forEach(key => { if (req.body[key] !== undefined) item[key] = req.body[key]; });
    await item.save();
    res.json({ success: true, message: "Item updated", item });
  } catch (err) { next(err); }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    if (String(item.reportedBy) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You cannot delete this item" });
    }
    await Claim.deleteMany({ item: item._id });
    await item.deleteOne();
    res.json({ success: true, message: "Item deleted" });
  } catch (err) { next(err); }
});

module.exports = router;
