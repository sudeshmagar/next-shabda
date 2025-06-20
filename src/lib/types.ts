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
    synonyms?: string[];
    antonyms?: string[];
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
    synonyms?: string[];
    antonyms?: string[];
}

export interface DictionaryEntry {
    _id: string;
    word: string;
    english?: string;
    romanized?: string;
    phonetic?: string;
    definitions?: Definition[];
    createdBy?: string;
    updatedBy?: string;
    status?: 'draft' | 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: Date;
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

export type UserRole = 'user' | 'editor' | 'admin' | 'superadmin';
export type Permission = 'create_words' | 'edit_words' | 'delete_words' | 'manage_users' | 'assign_roles' | 'view_analytics' | 'approve_words';

export interface User {
    _id: string;
    email: string;
    name: string;
    password: string;
    role?: UserRole;
    image?: string;
    contributions?: {
        wordsCreated: number;
        wordsEdited: number;
        wordsDeleted: number;
        lastContribution?: Date;
    };
    assignedBy?: string;
    assignedAt?: Date;
    permissions?: Permission[];
    createdAt: Date;
    updatedAt: Date;
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

// Dashboard analytics types
export interface DashboardStats {
    totalWords: number;
    totalUsers: number;
    pendingApprovals: number;
    recentContributions: number;
    userContributions: {
        wordsCreated: number;
        wordsEdited: number;
        wordsDeleted: number;
    };
}

export interface UserContribution {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    contributions: {
        wordsCreated: number;
        wordsEdited: number;
        wordsDeleted: number;
        lastContribution?: Date;
    };
}