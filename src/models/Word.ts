import mongoose, {model, Schema} from "mongoose";

const WordSchema = new Schema({
        word: String,
        english: String,
        romanized: String,
        phonetic: String,
        definitions: [
            {
                grammar: String,
                etymology: String,
                senses: {
                    nepali: [String],
                    english: [String],
                },
                examples: {
                    nepali: [String],
                    english: [String],
                },
                synonyms: [String],
                antonyms: [String],
            },
        ],
        // Contribution tracking
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        status: { 
            type: String, 
            enum: ['draft', 'pending', 'approved', 'rejected'], 
            default: 'approved' 
        },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        approvedAt: { type: Date },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        collection: "words",
    }
);

// Update the updatedAt field on save
WordSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.models.Word || model("Word", WordSchema);
