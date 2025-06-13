export interface Senses {
    nepali?: string[];
    english?: string[];
}

export interface Examples {
    nepali?: string[];
    english?: string[];
}

export interface Definition {
    id: string;
    grammar?: string;
    etymology?: string;
    senses: Senses;
    examples?: Examples;
}

export interface DictionaryEntry {
    id: string;
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
    entryId: string;
    entry: DictionaryEntry;
    createdAt: Date;
}

export interface User {
    id: string;
    email: string;
    name: string;
    password: string;
    role?: "user" | "admin";
    createdAt: Date;
}