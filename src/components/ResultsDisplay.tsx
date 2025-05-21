// src/components/ResultsDisplay.tsx
// ... (other imports and code remain the same)
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Download, Copy, ArrowRight, FileText } from "lucide-react";
import * as HTMLToDOCX_Namespace from 'html-to-docx';
import { saveAs } from 'file-saver';

// --- Type Definitions ---
// ... (your existing type definitions)
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
// ... (extractTitleFromHtml and extractTextFromHtml remain the same)
const extractTitleFromHtml = (htmlString: string): string | null => {
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


// --- Component ---
const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, onNewArticle }) => {
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloadingDocx, setIsDownloadingDocx] = useState(false);

  const processedArticle = useMemo(() => {
    // ... (processedArticle logic remains the same)
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
    // ... (downloadImage function remains the same)
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
    // ... (copyArticleText function remains the same)
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

  const downloadAsDocx = async () => {
    setIsDownloadingDocx(true);
    if (!mainHtmlContent && !displayTitle) {
      toast({
        title: "Алдаа",
        description: "DOCX файл руу хөрвүүлэх агуулга олдсонгүй.",
        variant: "destructive",
        duration: 3000,
      });
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
      if (HTMLToDOCX_Namespace && typeof HTMLToDOCX_Namespace.asBlob === 'function') {
        conversionFunction = HTMLToDOCX_Namespace.asBlob;
        console.log("Using HTMLToDOCX_Namespace.asBlob");
      } else if (HTMLToDOCX_Namespace && HTMLToDOCX_Namespace.default) {
        if (typeof HTMLToDOCX_Namespace.default === 'function') {
          conversionFunction = HTMLToDOCX_Namespace.default;
          console.log("Using HTMLToDOCX_Namespace.default as function");
        } else if (typeof HTMLToDOCX_Namespace.default.asBlob === 'function') {
          conversionFunction = HTMLToDOCX_Namespace.default.asBlob;
          console.log("Using HTMLToDOCX_Namespace.default.asBlob");
        }
      }
      
      if (typeof conversionFunction !== 'function') {
        console.error("html-to-docx module structure:", HTMLToDOCX_Namespace);
        throw new Error("DOCX хөрвүүлэх функц (asBlob эсвэл default) олдсонгүй. Таны 'html-to-docx' сангийн хувилбарыг шалгана уу эсвэл console лог-г харна уу.");
      }

      console.log("Attempting to convert HTML to DOCX...");
      const uint8ArrayBuffer = await conversionFunction(htmlToConvert, { // Renamed to uint8ArrayBuffer for clarity
        orientation: 'portrait',
        margins: { top: 720, right: 720, bottom: 720, left: 720 },
      });

      console.log("Conversion result (should be Uint8Array):", uint8ArrayBuffer);
      console.log("Type of conversion result:", typeof uint8ArrayBuffer);

      if (!(uint8ArrayBuffer instanceof Uint8Array)) { // Check if it's a Uint8Array
        console.error("Conversion did not return a Uint8Array:", uint8ArrayBuffer);
        throw new TypeError("DOCX хөрвүүлэлтийн үр дүн хүлээгдэж буй Uint8Array биш байна.");
      }

      // Convert Uint8Array to Blob with the correct MIME type
      const docxBlob = new Blob([uint8ArrayBuffer], { 
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
      });
      console.log("Converted to Blob:", docxBlob);
      console.log("Is it a Blob?", docxBlob instanceof Blob);


      const sanitizedTitle = displayTitle.replace(/[^a-z0-9_]/gi, '_').toLowerCase() || 'нийтлэл';
      saveAs(docxBlob, `${sanitizedTitle}.docx`); // Pass the new Blob to saveAs

      toast({
        title: "Амжилттай",
        description: "Нийтлэгийг DOCX хэлбэрээр татаж авлаа.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error converting to DOCX:", error); 
      toast({
        title: "Алдаа",
        description: error instanceof Error ? error.message : "DOCX файл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsDownloadingDocx(false);
    }
  };

  return (
    // ... JSX for rendering remains the same ...
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