import mongoose, { Schema} from "mongoose";

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    role: { 
        type: String, 
        enum: ["user", "editor", "admin", "superadmin"], 
        default: "user" 
    },
    // Contribution tracking
    contributions: {
        wordsCreated: { type: Number, default: 0 },
        wordsEdited: { type: Number, default: 0 },
        wordsDeleted: { type: Number, default: 0 },
        lastContribution: { type: Date },
    },
    // Role management
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date },
    permissions: [{
        type: String,
        enum: [
            'create_words',
            'edit_words', 
            'delete_words',
            'manage_users',
            'assign_roles',
            'view_analytics',
            'approve_words'
        ]
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { collection: "users" });

// Update the updatedAt field on save
UserSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);