// src/types/article.ts

export interface FormData {
  garchig: string;
  sudalgaaniiChiglel: string;
  niitleliinUrt: string;
  niitleliinUnguAyas: string;
}

// --- Primary Data Structures for Article Display ---

/**
 * Core JSON structure for detailed article content within an API item.
 */
export interface ArticleJsonDetail {
  content: string;        // HTML string
  coverImage?: string;     // Base64 string (raw, without 'data:image/png;base64,' prefix)
  generatedTitle?: string; // Optional explicit title from the JSON
}

/**
 * Represents an item in the new array data structure, typically from an API response.
 * This is the primary array format ResultsDisplay expects.
 * Example: [{ json: { content: "...", coverImage: "..." }, pairedItem: { ... } }]
 */
export interface ArticleApiItem {
  json: ArticleJsonDetail;
  pairedItem?: { // As per the example provided by user
    item: number;
  };
}

/**
 * Represents processed data for a single article.
 * This can be used as a fallback for ResultsDisplay or for direct single-object data provision (e.g., from debug upload).
 */
export interface SingleArticleProcessedData {
  content?: string;         // HTML string
  coverImage?: string;      // Base64 string (raw or full data URL) - ResultsDisplay will handle prefixing if raw
  imageBase64?: string;     // Fallback for coverImage (raw Base64) if coverImage isn't a full data URL
  generatedTitle?: string;  // Explicit title
}

/**
 * The type for the 'data' prop of the rewritten ResultsDisplay component.
 * It can accept an array of new API items or a single processed article object.
 */
export type ResultsDisplayInput = ArticleApiItem[] | SingleArticleProcessedData;


// --- Legacy Types (Retained for reference or other parts of the application if needed) ---
// This was the original structure for ArticleData.
// Index.tsx used its 'status' and 'errorMessage' fields.
// ResultsDisplay has been updated to not rely on this complex structure directly.
export interface LegacyArticleData {
  status: "success" | "error";
  coverImage?: string;
  content?: string; // This could be HTML or structured content depending on context
  generatedTitle?: string;
  imageBase64?: string;
  introduction?: {
    type: "introduction_paragraph";
    content: string;
  };
  sections?: ArticleSection[];
  conclusion?: {
    type: "conclusion_paragraph";
    content: string;
  };
  errorMessage?: string;
}

export interface ArticleSection { // Part of LegacyArticleData
  type: "heading" | "paragraph" | "list";
  level?: number;
  content?: string;
  ordered?: boolean;
  items?: string[];
}

/**
 * For InputForm's debug file upload if the uploaded JSON file has this specific nested structure.
 * InputForm will parse this and should convert its 'json' content to SingleArticleProcessedData.
 */
export interface DebugFileJsonStructure {
  json: {
    content: string;
    coverImage: string; // Assumed to be raw Base64
    generatedTitle?: string;
  };
  pairedItem?: {
    item: number;
  };
}