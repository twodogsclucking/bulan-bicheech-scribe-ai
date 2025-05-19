import React, { useState, useEffect } from "react";
// Assuming ArticleData is defined in '@/types/article'
// and its structure is something like:
// interface ArticleData {
//   content?: string;         // HTML string
//   coverImage?: string;      // Base64 string or full data URL
//   imageBase64?: string;     // Fallback for coverImage
//   generatedTitle?: string;  // Preferred explicit title
//
//   // Fields for "old format" if content is not present
//   introduction?: { content: string };
//   sections?: Array<{
//     type: "heading" | "paragraph" | "list";
//     level?: number;
//     content?: string;
//     items?: string[];
//     ordered?: boolean;
//   }>;
//   conclusion?: { content: string };
// }
import { ArticleData } from "@/types/article"; // Your existing import
import { Button } from "@/components/ui/button"; // Your existing import
import { toast } from "@/hooks/use-toast";       // Your existing import
import { Download, Copy, ArrowRight } from "lucide-react";

interface ResultsDisplayProps {
  data: ArticleData;
  onNewArticle: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, onNewArticle }) => {
  const [isCopying, setIsCopying] = useState(false);
  const [finalImageSource, setFinalImageSource] = useState<string>("");
  const [displayTitle, setDisplayTitle] = useState<string>("Нийтлэл");

  useEffect(() => {
    // --- IMAGE SOURCE LOGIC ---
    let imageSrc = "";
    const rawCoverImage = data.coverImage;
    const rawImageBase64 = data.imageBase64;

    if (rawCoverImage && typeof rawCoverImage === 'string') {
      if (rawCoverImage.startsWith('data:image')) {
        imageSrc = rawCoverImage;
      } else {
        // Assuming PNG if not a full data URL, based on downloadImage's filename.
        // Adjust "image/png" if your image types vary and can be determined.
        imageSrc = `data:image/png;base64,${rawCoverImage}`;
      }
    } else if (rawImageBase64 && typeof rawImageBase64 === 'string') { // Fallback
      if (rawImageBase64.startsWith('data:image')) {
        imageSrc = rawImageBase64;
      } else {
        imageSrc = `data:image/png;base64,${rawImageBase64}`;
      }
    }
    setFinalImageSource(imageSrc);

    // --- TITLE LOGIC ---
    let titleStr = "Нийтлэл"; // Default title

    if (data.generatedTitle && typeof data.generatedTitle === 'string' && data.generatedTitle.trim() !== "") {
      titleStr = data.generatedTitle.trim();
    } else if (data.content && typeof data.content === 'string') {
      // Try to extract title from HTML content if generatedTitle is not available
      // This part runs in the browser, so document is available.
      try {
        const tempEl = document.createElement('div');
        tempEl.innerHTML = data.content;
        const titleTag = tempEl.querySelector('title');
        if (titleTag && titleTag.textContent && titleTag.textContent.trim() !== "") {
          titleStr = titleTag.textContent.trim();
        }
      } catch (e) {
        console.error("Error parsing HTML to extract title:", e);
        // titleStr remains default if error or no title tag
      }
    }
    setDisplayTitle(titleStr);

  }, [data]); // Recalculate when data changes

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
    link.download = `image.png`; // Consider making filename dynamic if type varies
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
    setIsCopying(true);
    let textToCopy = "";

    if (data.content && typeof data.content === 'string') {
      const tempEl = document.createElement('div');
      tempEl.innerHTML = data.content;
      textToCopy = tempEl.textContent || tempEl.innerText || "";
    } else if (data.generatedTitle || data.introduction || data.sections || data.conclusion) {
      // Fallback to "old format" if HTML content is missing
      // Use the explicitly provided generatedTitle for copying if it exists in the data object
      if (data.generatedTitle && typeof data.generatedTitle === 'string') {
        textToCopy += `${data.generatedTitle}\n\n`;
      }
      
      if (data.introduction?.content && typeof data.introduction.content === 'string') {
        textToCopy += `${data.introduction.content}\n\n`;
      }
      
      if (data.sections) {
        data.sections.forEach((section) => {
          if (section.content && typeof section.content === 'string' && (section.type === "heading" || section.type === "paragraph")) {
             textToCopy += `${section.content}\n\n`;
          } else if (section.type === "list" && section.items) {
            section.items.forEach((item, index) => {
              if (typeof item === 'string') {
                if (section.ordered) {
                  textToCopy += `${index + 1}. ${item}\n`;
                } else {
                  textToCopy += `• ${item}\n`;
                }
              }
            });
            textToCopy += "\n";
          }
        });
      }

      if (data.conclusion?.content && typeof data.conclusion.content === 'string') {
        textToCopy += `${data.conclusion.content}`;
      }

      textToCopy = textToCopy
        .replace(/\*\*(.*?)\*\*/g, "$1") 
        .replace(/\*(.*?)\*/g, "$1");
    }

    if (!textToCopy.trim()) {
        toast({
            title: "Анхаар",
            description: "Хуулах текст олдсонгүй.",
            variant: "destructive",
            duration: 2000,
        });
        setIsCopying(false);
        return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Амжилттай",
        description: "Нийтлэлийн текст хуулагдлаа.",
        duration: 2000,
      });
      setIsCopying(false);
    }).catch(err => {
      console.error("Could not copy text: ", err);
      toast({
        title: "Алдаа",
        description: "Текст хуулж чадсангүй.",
        variant: "destructive",
        duration: 2000,
      });
      setIsCopying(false);
    });
  };

  const renderMarkdown = (content: string | undefined): string => {
    if (typeof content !== 'string') return "";
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-[#3B5999] mb-4">{displayTitle}</h1>
      </div>

      {finalImageSource && (
        <div className="bg-white rounded-lg overflow-hidden shadow-md relative">
          <img src={finalImageSource} alt="Нийтлэлийн зураг" className="w-full h-auto object-cover" />
          <Button
            variant="outline"
            size="sm"
            onClick={downloadImage}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          >
            <Download className="h-4 w-4 mr-1" /> Зураг Татах
          </Button>
        </div>
      )}

      <div className="prose prose-lg max-w-none bg-white p-6 rounded-lg shadow-md">
        {data.content && typeof data.content === 'string' ? (
          <div dangerouslySetInnerHTML={{ __html: data.content }}></div>
        ) : (
          <>
            {data.introduction?.content && (
              <div className="mb-6">
                <p
                  className="text-[#333333] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(data.introduction.content) }}
                ></p>
              </div>
            )}

            {data.sections?.map((section, index) => {
              if (section.type === "heading" && section.content) {
                return (
                  <div key={index} className="mt-6 mb-4">
                    {section.level === 2 ? (
                      <h2 className="text-xl font-bold text-[#008080]">{section.content}</h2>
                    ) : (
                      <h3 className="text-lg font-semibold text-[#008080]">{section.content}</h3>
                    )}
                  </div>
                );
              } else if (section.type === "paragraph" && section.content) {
                return (
                  <div key={index} className="my-4">
                    <p
                      className="text-[#333333] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(section.content) }}
                    ></p>
                  </div>
                );
              } else if (section.type === "list" && section.items) {
                return (
                  <div key={index} className="my-4">
                    {section.ordered ? (
                      <ol className="list-decimal pl-5 space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="text-[#333333]"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(item) }}
                          ></li>
                        ))}
                      </ol>
                    ) : (
                      <ul className="list-disc pl-5 space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="text-[#333333]"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(item) }}
                          ></li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              }
              return null;
            })}

            {data.conclusion?.content && (
              <div className="mt-6">
                <p
                  className="text-[#333333] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(data.conclusion.content) }}
                ></p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
        <Button
          variant="outline"
          onClick={copyArticleText}
          disabled={isCopying}
          className="flex-1 py-6 border-[#3B5999] text-[#3B5999] hover:bg-[#3B5999]/10"
        >
          <Copy className="h-5 w-5 mr-2" /> Нийтлэл Хуулах
        </Button>
        
        <Button
          onClick={onNewArticle}
          className="flex-1 py-6 bg-gradient-to-r from-[#FFD700] to-[#FFA07A] hover:from-[#FFD700]/90 hover:to-[#FFA07A]/90 text-[#333333] font-bold shadow-md"
        >
          Шинэ Нийтлэл Бичүүлэх <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
