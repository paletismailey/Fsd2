import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  subject: { type: String, trim: true, maxlength: 300, default: "" },
  body: { type: String, required: true, maxlength: 20000 },
  score: { type: Number, required: true, min: 0, max: 100 },
  classification: { type: String, enum: ["Spam", "Suspicious", "Likely Safe"], required: true },
  signals: [{ type: String, maxlength: 200 }],
}, { timestamps: true });

export default mongoose.model("Analysis", analysisSchema);
