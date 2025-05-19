
export interface FormData {
  garchig: string;
  sudalgaaniiChiglel: string;
  niitleliinUrt: string;
  niitleliinUnguAyas: string;
}

// Updated interface for the new JSON structure
export interface ArticleData {
  status: "success" | "error";
  coverImage?: string;  // Base64 encoded image
  content?: string;     // HTML content
  
  // Legacy fields for backward compatibility
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

export interface ArticleSection {
  type: "heading" | "paragraph" | "list";
  level?: number;
  content?: string;
  ordered?: boolean;
  items?: string[];
}

// New interface for the nested JSON structure
export interface NestedJsonResponse {
  json: {
    content: string;
    coverImage: string;
  };
  pairedItem: {
    item: number;
  };
}
