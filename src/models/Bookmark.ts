import mongoose from "mongoose";

const BookmarkSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    wordId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Bookmark || mongoose.model("Bookmark", BookmarkSchema);