import React, { useState } from "react";
import { ArticleData } from "@/types/article";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Download, Copy, ArrowRight } from "lucide-react";

interface ResultsDisplayProps {
  data: ArticleData;
  onNewArticle: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, onNewArticle }) => {
  const [isCopying, setIsCopying] = useState(false);

  // Get the image source from either the new or old format
  const imageSource = data.coverImage || data.imageBase64 || "";
  
  // Get the title from either format
  const title = data.generatedTitle || "Нийтлэл";

  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = imageSource;
    link.download = `image.png`;
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

    // Check if we have HTML content (new format)
    if (data.content) {
      // Create a temporary element to parse the HTML
      const tempEl = document.createElement('div');
      tempEl.innerHTML = data.content;
      
      // Extract text content, removing HTML tags
      textToCopy = tempEl.textContent || tempEl.innerText || "";
    } 
    // Otherwise use the old format
    else if (data.generatedTitle) {
      textToCopy = `${data.generatedTitle}\n\n`;
      
      if (data.introduction) {
        textToCopy += `${data.introduction.content}\n\n`;
      }
      
      if (data.sections) {
        data.sections.forEach((section) => {
          if (section.type === "heading") {
            textToCopy += `${section.content}\n\n`;
          } else if (section.type === "paragraph") {
            textToCopy += `${section.content}\n\n`;
          } else if (section.type === "list") {
            section.items?.forEach((item, index) => {
              if (section.ordered) {
                textToCopy += `${index + 1}. ${item}\n`;
              } else {
                textToCopy += `• ${item}\n`;
              }
            });
            textToCopy += "\n";
          }
        });
      }

      if (data.conclusion) {
        textToCopy += `${data.conclusion.content}`;
      }

      // Remove Markdown formatting for plain text
      textToCopy = textToCopy
        .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
        .replace(/\*(.*?)\*/g, "$1"); // Italic
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
      setIsCopying(false);
    });
  };

  // Function to render Markdown content
  const renderMarkdown = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-[#3B5999] mb-4">{title}</h1>
      </div>

      {imageSource && (
        <div className="bg-white rounded-lg overflow-hidden shadow-md relative">
          <img src={imageSource} alt="Нийтлэлийн зураг" className="w-full h-auto object-cover" />
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
        {/* Display HTML content if we have it (new format) */}
        {data.content ? (
          <div dangerouslySetInnerHTML={{ __html: data.content }}></div>
        ) : (
          // Display the old format content
          <>
            <div className="mb-6">
              {data.introduction && (
                <p 
                  className="text-[#333333] leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(data.introduction.content) }}
                ></p>
              )}
            </div>

            {data.sections?.map((section, index) => {
              if (section.type === "heading") {
                return (
                  <div key={index} className="mt-6 mb-4">
                    {section.level === 2 ? (
                      <h2 className="text-xl font-bold text-[#008080]">{section.content}</h2>
                    ) : (
                      <h3 className="text-lg font-semibold text-[#008080]">{section.content}</h3>
                    )}
                  </div>
                );
              } else if (section.type === "paragraph") {
                return (
                  <div key={index} className="my-4">
                    <p 
                      className="text-[#333333] leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: section.content ? renderMarkdown(section.content) : "" }}
                    ></p>
                  </div>
                );
              } else if (section.type === "list") {
                return (
                  <div key={index} className="my-4">
                    {section.ordered ? (
                      <ol className="list-decimal pl-5 space-y-2">
                        {section.items?.map((item, itemIndex) => (
                          <li 
                            key={itemIndex}
                            className="text-[#333333]"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(item) }}
                          ></li>
                        ))}
                      </ol>
                    ) : (
                      <ul className="list-disc pl-5 space-y-2">
                        {section.items?.map((item, itemIndex) => (
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

            {data.conclusion && (
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
