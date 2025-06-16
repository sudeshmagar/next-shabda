export interface Word {
  _id: string;
  id: string;
  word: string;
  english: string;
  romanized: string;
  phonetic?: string;
  grammar: string;
  definitions: {
    nepali: string;
    english: string;
    examples?: {
      nepali: string;
      english: string;
    }[];
  }[];
  bookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
} 