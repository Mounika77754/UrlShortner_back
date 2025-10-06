const mongoose=require("mongoose")
const dotenv=require("dotenv");
dotenv.config();

const urlSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  clicks: { type: Number, default: 0 }
}, { timestamps: true });

const urls=mongoose.model("urls",urlSchema);

module.exports=urls