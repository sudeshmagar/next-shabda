import { Schema, model, models } from "mongoose";

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
        },
    ],
});

export default models.Word || model("Word", WordSchema);
