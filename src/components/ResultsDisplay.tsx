import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Download, Copy, ArrowRight, FileText } from "lucide-react";
import * as HTMLToDOCX_Namespace from 'html-to-docx';
import { saveAs } from 'file-saver';

// --- Type Definitions ---
// ... (Your existing type definitions: ArticleJsonData, NewArticleFormatItem, etc.)
interface ArticleJsonData {
  content: string;
  coverImage?: string;
  generatedTitle?: string;
}

interface NewArticleFormatItem {
  json: ArticleJsonData;
}

interface FallbackArticleData {
  content?: string;
  coverImage?: string;
  imageBase64?: string;
  generatedTitle?: string;
}

type ResultsDisplayData = NewArticleFormatItem[] | FallbackArticleData;

interface ResultsDisplayProps {
  data: ResultsDisplayData;
  onNewArticle: () => void;
}


// --- Helper Functions ---
const extractTitleFromHtml = (htmlString: string): string | null => {
  // ... (existing function)
  if (typeof window === "undefined") return null;
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

const extractTextFromHtml = (htmlString: string): string => {
  // ... (existing function)
  if (typeof window === "undefined") return "";
  try {
    const tempEl = document.createElement('div');
    tempEl.innerHTML = htmlString;
    return tempEl.textContent || tempEl.innerText || "";
  } catch (e) {
    console.error("Error extracting text from HTML:", e);
    return "";
  }
};

// NEW: Helper function to sanitize and transliterate filenames
const sanitizeAndTransliterateFilename = (name: string, defaultName: string = "download"): string => {
  if (!name || name.trim() === "") {
    return defaultName;
  }

  // Basic Mongolian Cyrillic to Latin transliteration map
  const cyrillicToLatinMap: { [key: string]: string } = {
    'А': 'A', 'а': 'a', 'Б': 'B', 'б': 'b', 'В': 'V', 'в': 'v', 'Г': 'G', 'г': 'g',
    'Д': 'D', 'д': 'd', 'Е': 'E', 'е': 'e', 'Ё': 'Yo', 'ё': 'yo', 'Ж': 'J', 'ж': 'j',
    'З': 'Z', 'з': 'z', 'И': 'I', 'и': 'i', 'Й': 'Y', 'й': 'y', 'К': 'K', 'к': 'k',
    'Л': 'L', 'л': 'l', 'М': 'M', 'м': 'm', 'Н': 'N', 'н': 'n', 'О': 'O', 'о': 'o',
    'Ө': 'O', 'ө': 'o', // Simplified for broad compatibility (could also be U)
    'П': 'P', 'п': 'p', 'Р': 'R', 'р': 'r', 'С': 'S', 'с': 's', 'Т': 'T', 'т': 't',
    'У': 'U', 'у': 'u', 'Ү': 'U', 'ү': 'u', // Simplified for broad compatibility (could also be UE)
    'Ф': 'F', 'ф': 'f', 'Х': 'Kh', 'х': 'kh', 'Ц': 'Ts', 'ц': 'ts', 'Ч': 'Ch', 'ч': 'ch',
    'Ш': 'Sh', 'ш': 'sh', 'Щ': 'Shch', 'щ': 'shch', 
    'Ъ': '', 'ъ': '', 'Ы': 'Y', 'ы': 'y', 'Ь': '', 'ь': '', 
    'Э': 'E', 'э': 'e', 'Ю': 'Yu', 'ю': 'yu', 'Я': 'Ya', 'я': 'ya',
    ' ': '_' // Replace spaces with underscores
  };

  let latinName = "";
  for (let i = 0; i < name.length; i++) {
    latinName += cyrillicToLatinMap[name[i]] || name[i];
  }

  // Remove any remaining non-Latin alphanumeric characters (keeps Latin letters, numbers, and underscores)
  let sanitized = latinName.replace(/[^a-zA-Z0-9_]/g, '_');
  // Replace multiple underscores with a single one
  sanitized = sanitized.replace(/__+/g, '_');
  // Trim underscores from start and end
  sanitized = sanitized.replace(/^_+|_+$/g, '');
  // Convert to lowercase
  sanitized = sanitized.toLowerCase();

  // If the name is too short or became empty after sanitization, use the default name
  if (!sanitized || sanitized.length < 2) { 
    return defaultName;
  }

  return sanitized;
};


// --- Component ---
const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, onNewArticle }) => {
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const processedArticle = useMemo(() => {
    // ... (existing logic remains the same)
    let title: string = "Нийтлэл";
    let imageSource: string = "";
    let mainHtmlContent: string = "";

    if (Array.isArray(data) && data.length > 0 && data[0]?.json) {
      const articleJson = data[0].json;
      if (articleJson.coverImage && typeof articleJson.coverImage === 'string') {
        imageSource = `data:image/png;base64,${articleJson.coverImage}`;
      }
      if (articleJson.generatedTitle?.trim()) {
        title = articleJson.generatedTitle.trim();
      } else if (articleJson.content) {
        const extractedTitle = extractTitleFromHtml(articleJson.content);
        if (extractedTitle) title = extractedTitle;
      }
      if (articleJson.content) {
        mainHtmlContent = articleJson.content;
      }
    } else if (!Array.isArray(data) && data) {
      const fallbackData = data as FallbackArticleData;
      if (fallbackData.coverImage && typeof fallbackData.coverImage === 'string') {
        if (fallbackData.coverImage.startsWith('data:image')) {
          imageSource = fallbackData.coverImage;
        } else {
          imageSource = `data:image/png;base64,${fallbackData.coverImage}`;
        }
      } else if (fallbackData.imageBase64 && typeof fallbackData.imageBase64 === 'string') {
        imageSource = `data:image/png;base64,${fallbackData.imageBase64}`;
      }
      if (fallbackData.generatedTitle?.trim()) {
        title = fallbackData.generatedTitle.trim();
      } else if (fallbackData.content) {
        const extractedTitle = extractTitleFromHtml(fallbackData.content);
        if (extractedTitle) title = extractedTitle;
      }
      if (fallbackData.content) {
        mainHtmlContent = fallbackData.content;
      }
    }
    return { title, imageSource, mainHtmlContent };
  }, [data]);

  const { title: displayTitle, imageSource: finalImageSource, mainHtmlContent } = processedArticle;

  const downloadImage = () => {
    if (!finalImageSource) {
      toast({ title: "Алдаа", description: "Татах зураг олдсонгүй.", variant: "destructive", duration: 2000 });
      return;
    }
    const link = document.createElement("a");
    link.href = finalImageSource;
    // Use the new sanitization function for the image filename
    const baseFilename = sanitizeAndTransliterateFilename(displayTitle, 'article_image');
    link.download = `${baseFilename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Амжилттай", description: "Зураг татаж авлаа.", duration: 2000 });
  };

  const copyArticleText = () => {
    // ... (existing copyArticleText logic)
     if (!mainHtmlContent) {
      toast({ title: "Анхаар", description: "Хуулах боломжтой текст олдсонгүй.", variant: "destructive", duration: 2000 });
      return;
    }
    const textToCopy = extractTextFromHtml(mainHtmlContent);
    if (!textToCopy.trim()) {
      toast({ title: "Анхаар", description: "Нийтлэлд хуулах текст байхгүй байна.", variant: "destructive", duration: 2000 });
      return;
    }
    setIsCopying(true);
    navigator.clipboard.writeText(textToCopy)
      .then(() => { toast({ title: "Амжилттай", description: "Нийтлэлийн текст хуулагдлаа.", duration: 2000 }); })
      .catch(err => {
        console.error("Could not copy text: ", err);
        toast({ title: "Алдаа", description: "Текст хуулж чадсангүй. Та өөрөө сонгож хуулна уу.", variant: "destructive", duration: 3000 });
      })
      .finally(() => { setIsCopying(false); });
  };

  const downloadAsDocx = async () => {
    // ... (existing logic up to htmlToConvert)
    setIsDownloadingDocx(true);
    if (!mainHtmlContent && !displayTitle) {
      toast({ title: "Алдаа", description: "DOCX файл руу хөрвүүлэх агуулга олдсонгүй.", variant: "destructive", duration: 3000 });
      setIsDownloadingDocx(false);
      return;
    }

    let htmlToConvert = `<h1>${displayTitle}</h1>`;
    if (finalImageSource) {
      htmlToConvert += `<p><img src="${finalImageSource}" alt="${displayTitle || 'Cover Image'}" style="width:100%; max-width:550px; height:auto; display:block; margin: 0 auto;" /></p><br />`;
    }
    htmlToConvert += mainHtmlContent || "<p>Нийтлэлийн агуулга хоосон байна.</p>";

    try {
      let conversionFunction;
      // ... (existing conversionFunction detection logic)
      if (HTMLToDOCX_Namespace && typeof HTMLToDOCX_Namespace.asBlob === 'function') {
        conversionFunction = HTMLToDOCX_Namespace.asBlob;
      } else if (HTMLToDOCX_Namespace && HTMLToDOCX_Namespace.default) {
        if (typeof HTMLToDOCX_Namespace.default === 'function') {
          conversionFunction = HTMLToDOCX_Namespace.default;
        } else if (typeof HTMLToDOCX_Namespace.default.asBlob === 'function') {
          conversionFunction = HTMLToDOCX_Namespace.default.asBlob;
        }
      }
      
      if (typeof conversionFunction !== 'function') {
        console.error("html-to-docx module structure:", HTMLToDOCX_Namespace);
        throw new Error("DOCX хөрвүүлэх функц олдсонгүй.");
      }

      const conversionResult = await conversionFunction(htmlToConvert, {
        orientation: 'portrait',
        margins: { top: 720, right: 720, bottom: 720, left: 720 },
      });

      let docxBlobToSave: Blob;
      if (conversionResult instanceof Blob) {
        docxBlobToSave = conversionResult;
      } else if (conversionResult instanceof Uint8Array) {
        docxBlobToSave = new Blob([conversionResult], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      } else {
        console.error("Unexpected conversion result type:", conversionResult);
        throw new TypeError("DOCX хөрвүүлэлтээс танигдаагүй төрлийн үр дүн буцлаа.");
      }
      
      // Use the new sanitization function for the DOCX filename
      const baseFilename = sanitizeAndTransliterateFilename(displayTitle, 'article');
      saveAs(docxBlobToSave, `${baseFilename}.docx`);

      toast({ title: "Амжилттай", description: "Нийтлэгийг DOCX хэлбэрээр татаж авлаа.", duration: 3000 });
    } catch (error) {
      console.error("Error converting to DOCX:", error); 
      toast({ title: "Алдаа", description: error instanceof Error ? error.message : "DOCX файл үүсгэхэд алдаа гарлаа.", variant: "destructive", duration: 3000 });
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  return (
    // ... (The rest of your JSX rendering remains the same)
    <div className="space-y-6 md:space-y-8">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-[#3B5999] mb-2 md:mb-4 px-2">{displayTitle}</h1>
      </div>

      {finalImageSource && (
        <div className="bg-white rounded-lg overflow-hidden shadow-md relative mx-auto max-w-3xl">
          <img 
            src={finalImageSource} 
            alt="Нийтлэлийн зураг" 
            className="w-full h-auto object-cover max-h-[400px] md:max-h-[500px]"
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 justify-center mt-6 md:mt-8">
        <Button
          variant="outline"
          onClick={copyArticleText}
          disabled={isCopying || !mainHtmlContent}
          className="w-full py-3 sm:py-4 text-sm sm:text-base border-blue-600 text-blue-600 hover:bg-blue-600/10 transition-colors duration-150"
        >
          <Copy className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> {isCopying ? "Хуулж байна..." : "Текст Хуулах"}
        </Button>

        <Button
          variant="outline"
          onClick={downloadAsDocx}
          disabled={isDownloadingDocx || (!mainHtmlContent && !displayTitle)}
          className="w-full py-3 sm:py-4 text-sm sm:text-base border-green-600 text-green-600 hover:bg-green-600/10 transition-colors duration-150"
        >
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> {isDownloadingDocx ? "Боловсруулж..." : "DOCX Татах"}
        </Button>

        <Button
          onClick={onNewArticle}
          className="w-full py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-[#FFD700] to-[#FFA07A] hover:from-[#FFD700]/90 hover:to-[#FFA07A]/90 text-[#333333] font-semibold shadow-md hover:shadow-lg transition-all duration-150"
        >
          Шинэ Нийтлэл <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;