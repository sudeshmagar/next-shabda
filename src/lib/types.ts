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
    grammar?: string;
    etymology?: string;
    senses: Senses;
    examples?: Examples;
}

export interface DictionaryEntry {
    _id: string;
    word?: string;
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
    createdAt: Date;
}