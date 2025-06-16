export interface Senses {
    nepali?: string[];
    english?: string[];
}

export interface Examples {
    nepali?: string[];
    english?: string[];
}

export interface Definition {
    _id: string;
    grammar: string;
    etymology: string;
    senses: {
        nepali: string[];
        english: string[];
    };
    examples: {
        nepali: string[];
        english: string[];
    };
}

export interface FormDefinition {
    grammar: string;
    etymology: string;
    senses: {
        nepali: string[];
        english: string[];
    };
    examples: {
        nepali: string[];
        english: string[];
    };
}

export interface DictionaryEntry {
    _id: string;
    word: string;
    english?: string;
    romanized?: string;
    phonetic?: string;
    definitions?: Definition[];
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Bookmark {
    id: string;
    _id: string;
    wordId: string;
    userId: string;
    entry: DictionaryEntry;
    createdAt: Date;
}

export interface User {
    _id: string;
    email: string;
    name: string;
    password: string;
    role?: "user" | "admin";
    image?: string;
    createdAt: Date;
}

export interface WordForm {
    word: string;
    romanized: string;
    phonetic?: string;
    english: string;
    definitions: FormDefinition[];
}

export interface ApiWordResponse extends DictionaryEntry {
    definitions: Definition[];
}

export type Language = 'nepali' | 'english';
export type DefinitionField = 'senses' | 'examples';