import { Router } from "express";
import mongoose from "mongoose";
import Analysis from "../models/Analysis.js";
import requireAuth from "../middleware/requireAuth.js";
import { classifyEmail } from "../services/classifier.js";

const router = Router();
router.use(requireAuth);

router.post("/", async (req, res, next) => {
  try {
    const subject = String(req.body.subject || "").trim();
    const body = String(req.body.body || "").trim();
    if (!body) return res.status(400).json({ message: "Email body is required." });
    if (subject.length > 300) return res.status(400).json({ message: "Subject must be 300 characters or fewer." });
    if (body.length > 20000) return res.status(400).json({ message: "Email body must be 20,000 characters or fewer." });

    const result = classifyEmail(subject, body);
    const analysis = await Analysis.create({ user: req.userId, subject, body, ...result });
    res.status(201).json({ analysis });
  } catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    const items = await Analysis.find({ user: req.userId })
      .select("-body").sort({ createdAt: -1 }).limit(100);
    res.json({ items });
  } catch (error) { next(error); }
});

router.get("/stats", async (req, res, next) => {
  try {
    const [total, spam, suspicious, safe] = await Promise.all([
      Analysis.countDocuments({ user: req.userId }),
      Analysis.countDocuments({ user: req.userId, classification: "Spam" }),
      Analysis.countDocuments({ user: req.userId, classification: "Suspicious" }),
      Analysis.countDocuments({ user: req.userId, classification: "Likely Safe" }),
    ]);
    res.json({ total, spam, suspicious, safe });
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid history item ID." });
    const deleted = await Analysis.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) return res.status(404).json({ message: "History item not found." });
    res.json({ message: "History item deleted." });
  } catch (error) { next(error); }
});

export default router;
