import mongoose, { Schema} from "mongoose";

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    createdAt: { type: Date, default: Date.now },
}, { collection: "users" });

export default mongoose.models.User || mongoose.model("User", UserSchema);