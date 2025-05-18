
export interface FormData {
  garchig: string;
  sudalgaaniiChiglel: string;
  niitleliinUrt: string;
  niitleliinUnguAyas: string;
}

export interface ArticleSection {
  type: "heading" | "paragraph" | "list";
  level?: number;
  content?: string;
  ordered?: boolean;
  items?: string[];
}

export interface ArticleData {
  status: "success" | "error";
  generatedTitle: string;
  imageBase64: string;
  introduction: {
    type: "introduction_paragraph";
    content: string;
  };
  sections: ArticleSection[];
  conclusion: {
    type: "conclusion_paragraph";
    content: string;
  };
  errorMessage?: string;
}
