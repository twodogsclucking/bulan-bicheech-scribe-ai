import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button"; // Your existing import
import { toast } from "@/hooks/use-toast";       // Your existing import
import { Download, Copy, ArrowRight } from "lucide-react";

// --- Type Definitions ---

/**
 * Represents the core JSON structure within each item of the new data array.
 */
interface ArticleJsonData {
  content: string;        // HTML string
  coverImage?: string;     // Base64 string (without 'data:image/png;base64,' prefix)
  generatedTitle?: string; // Optional explicit title provided in the JSON
}

/**
 * Represents an item in the new array data structure.
 * Example: [{ json: { content: "...", coverImage: "..." } }]
 */
interface NewArticleFormatItem {
  json: ArticleJsonData;
  // pairedItem?: any; // Retained from example, include if used, otherwise optional
}

/**
 * Represents the fallback data structure for direct file uploads ("debug method").
 * This allows the component to also accept a single object.
 */
interface FallbackArticleData {
  content?: string;         // HTML string
  coverImage?: string;      // Base64 string or a full data URL
  imageBase64?: string;     // Base64 string (raw, for fallback if coverImage is not a full URL)
  generatedTitle?: string;  // Explicit title
}

/**
 * The 'data' prop can be the new array format or the fallback single object.
 */
type ResultsDisplayData = NewArticleFormatItem[] | FallbackArticleData;

interface ResultsDisplayProps {
  data: ResultsDisplayData;
  onNewArticle: () => void;
}

// --- Helper Functions ---

/**
 * Extracts a title from an HTML string.
 * It first looks for a <title> tag, then for the first <h1>-<h6> tag.
 * @param htmlString The HTML content.
 * @returns The extracted title or null if not found.
 */
const extractTitleFromHtml = (htmlString: string): string | null => {
  if (typeof window === "undefined") return null; // Guard for server-side rendering
  try {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = htmlString;

    const titleTag = tempEl.querySelector('title');
    if (titleTag?.textContent?.trim()) {
      return titleTag.textContent.trim();
    }

    const headingTag = tempEl.querySelector('h1, h2, h3, h4, h5, h6');
    if (headingTag?.textContent?.trim()) {
      return headingTag.textContent.trim();
    }
  } catch (e) {
    console.error("Error parsing HTML to extract title:", e);
  }
  return null;
};

/**
 * Extracts plain text content from an HTML string.
 * @param htmlString The HTML content.
 * @returns The extracted plain text.
 */
const extractTextFromHtml = (htmlString: string): string => {
  if (typeof window === "undefined") return ""; // Guard for server-side rendering
  try {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = htmlString;
    return tempEl.textContent || tempEl.innerText || "";
  } catch (e) {
    console.error("Error extracting text from HTML:", e);
    return "";
  }
};

// --- Component ---

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, onNewArticle }) => {
  const [isCopying, setIsCopying] = useState(false);

  // Memoize processed article data to avoid redundant calculations.
  // This recalculates when the 'data' prop changes.
  const processedArticle = useMemo(() => {
    let title: string = "Нийтлэл"; // Default title
    let imageSource: string = "";
    let mainHtmlContent: string = "";

    // 1. Handle new array format (primary)
    if (Array.isArray(data) && data.length > 0 && data[0]?.json) {
      const articleJson = data[0].json;

      // Image from new format: expect raw Base64 string
      if (articleJson.coverImage && typeof articleJson.coverImage === 'string') {
        imageSource = `data:image/png;base64,${articleJson.coverImage}`;
      }

      // Title from new format: explicit or extracted from HTML
      if (articleJson.generatedTitle?.trim()) {
        title = articleJson.generatedTitle.trim();
      } else if (articleJson.content) {
        const extractedTitle = extractTitleFromHtml(articleJson.content);
        if (extractedTitle) title = extractedTitle;
      }

      // HTML content from new format
      if (articleJson.content) {
        mainHtmlContent = articleJson.content;
      }
    }
    // 2. Handle fallback "debug" object format
    else if (!Array.isArray(data) && data) { // 'data' here is FallbackArticleData
      const fallbackData = data as FallbackArticleData;

      // Image from fallback format
      if (fallbackData.coverImage && typeof fallbackData.coverImage === 'string') {
        if (fallbackData.coverImage.startsWith('data:image')) { // Already a data URL
            imageSource = fallbackData.coverImage;
        } else { // Assume raw Base64 string
            imageSource = `data:image/png;base64,${fallbackData.coverImage}`;
        }
      } else if (fallbackData.imageBase64 && typeof fallbackData.imageBase64 === 'string') { // Secondary fallback
        imageSource = `data:image/png;base64,${fallbackData.imageBase64}`;
      }

      // Title from fallback format: explicit or extracted from HTML
      if (fallbackData.generatedTitle?.trim()) {
        title = fallbackData.generatedTitle.trim();
      } else if (fallbackData.content) {
        const extractedTitle = extractTitleFromHtml(fallbackData.content);
        if (extractedTitle) title = extractedTitle;
      }
      
      // HTML content from fallback format
      if (fallbackData.content) {
        mainHtmlContent = fallbackData.content;
      }
    }
    return { title, imageSource, mainHtmlContent };
  }, [data]);

  const { title: displayTitle, imageSource: finalImageSource, mainHtmlContent } = processedArticle;

  const downloadImage = () => {
    if (!finalImageSource) {
      toast({
        title: "Алдаа",
        description: "Татах зураг олдсонгүй.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }
    const link = document.createElement("a");
    link.href = finalImageSource;
    // Sanitize title for filename or use a default
    const filename = (displayTitle.replace(/[^a-z0-9_]/gi, '_').toLowerCase() || 'article_image') + '.png';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Амжилттай",
      description: "Зураг татаж авлаа.",
      duration: 2000,
    });
  };

  const copyArticleText = () => {
    if (!mainHtmlContent) {
      toast({
        title: "Анхаар",
        description: "Хуулах боломжтой текст олдсонгүй.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    const textToCopy = extractTextFromHtml(mainHtmlContent);

    if (!textToCopy.trim()) {
      toast({
        title: "Анхаар",
        description: "Нийтлэлд хуулах текст байхгүй байна.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setIsCopying(true);
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast({
          title: "Амжилттай",
          description: "Нийтлэлийн текст хуулагдлаа.",
          duration: 2000,
        });
      })
      .catch(err => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Алдаа",
          description: "Текст хуулж чадсангүй. Та өөрөө сонгож хуулна уу.",
          variant: "destructive",
          duration: 3000,
        });
      })
      .finally(() => {
        setIsCopying(false);
      });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-[#3B5999] mb-2 md:mb-4 px-2">{displayTitle}</h1>
      </div>

      {finalImageSource && (
        <div className="bg-white rounded-lg overflow-hidden shadow-md relative mx-auto max-w-3xl"> {/* Centered image */}
          <img 
            src={finalImageSource} 
            alt="Нийтлэлийн зураг" 
            className="w-full h-auto object-cover max-h-[400px] md:max-h-[500px]" // Responsive max height
          />
          <Button
            variant="outline"
            size="sm"
            onClick={downloadImage}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-xs sm:text-sm p-1.5 sm:p-2"
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Зураг Татах
          </Button>
        </div>
      )}

      {mainHtmlContent ? (
        <div
          className="prose prose-slate lg:prose-lg max-w-none bg-white p-4 sm:p-6 rounded-lg shadow-md article-html-content"
          dangerouslySetInnerHTML={{ __html: mainHtmlContent }}
        />
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">Нийтлэлийн агуулга олдсонгүй эсвэл хоосон байна.</p>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-center mt-6 md:mt-8">
        <Button
          variant="outline"
          onClick={copyArticleText}
          disabled={isCopying || !mainHtmlContent}
          className="flex-1 py-3 sm:py-4 text-sm sm:text-base border-[#3B5999] text-[#3B5999] hover:bg-[#3B5999]/10 transition-colors duration-150"
        >
          <Copy className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> {isCopying ? "Хуулж байна..." : "Нийтлэл Хуулах"}
        </Button>

        <Button
          onClick={onNewArticle}
          className="flex-1 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-[#FFD700] to-[#FFA07A] hover:from-[#FFD700]/90 hover:to-[#FFA07A]/90 text-[#333333] font-semibold shadow-md hover:shadow-lg transition-all duration-150"
        >
          Шинэ Нийтлэл Бичүүлэх <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;