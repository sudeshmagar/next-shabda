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
    },
    {
        collection: "words",
    }
);

export default mongoose.models.Word || model("Word", WordSchema);
