// src/pages/Index.tsx

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import InputForm from "@/components/InputForm";
import LoadingIndicator from "@/components/LoadingIndicator";
import ResultsDisplay from "@/components/ResultsDisplay"; // Rewritten version will be used
import ErrorDisplay from "@/components/ErrorDisplay";
// Updated type imports:
import { FormData, ResultsDisplayInput, ArticleApiItem, SingleArticleProcessedData } from "@/types/article";

type AppState = "input" | "loading" | "results" | "error";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("input");
  const [formData, setFormData] = useState<FormData | null>(null);
  // Update resultsData state to use the new ResultsDisplayInput type
  const [resultsData, setResultsData] = useState<ResultsDisplayInput | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFormSubmit = async (data: FormData) => {
    setFormData(data);
    setAppState("loading");
    setResultsData(null); // Clear previous results
    setErrorMessage(""); // Clear previous errors

    try {
      const response = await fetch(
        "https://n8n.firaworks.com/webhook/31ebb46e-b3ff-4d77-843f-49e329bc8ad9",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            garchig: data.garchig,
            sudalgaaniiChiglel: data.sudalgaaniiChiglel,
            niitleliinUrt: data.niitleliinUrt,
            niitleliinUnguAyas: data.niitleliinUnguAyas,
          }),
        }
      );

      const responseData: any = await response.json();

      if (!response.ok) {
        const errorMsg = responseData?.message || responseData?.errorMessage || `Серверээс алдаа буцлаа (${response.status})`;
        throw new Error(errorMsg);
      }

      // The rewritten ResultsDisplay can handle ArticleApiItem[] or SingleArticleProcessedData.
      // We expect the API to return data in the format: ArticleApiItem[]
      if (Array.isArray(responseData) && responseData.length > 0 && responseData[0]?.json?.content) {
        setResultsData(responseData as ArticleApiItem[]);
      } else if (responseData?.json?.content) { // If API returns a single ArticleApiItem object (not in an array)
        setResultsData([responseData as ArticleApiItem]);
      } else if (responseData?.content || responseData?.generatedTitle) { // If API returns a flat SingleArticleProcessedData object
        setResultsData(responseData as SingleArticleProcessedData);
      } else {
        // Handle cases like { status: "error", errorMessage: "..." } if API might still send that
        if (responseData.status === "error" && responseData.errorMessage) {
           setErrorMessage(responseData.errorMessage);
           setAppState("error");
           return;
        }
        throw new Error("API-аас ирсэн өгөгдлийн бүтэц танигдсангүй эсвэл хоосон байна.");
      }
      
      setAppState("results");

    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage(error instanceof Error ? error.message : "Серверт хандахад алдаа гарлаа. Дахин оролдоно уу.");
      setAppState("error");
    }
  };

  const resetApp = () => {
    setAppState("input");
    setFormData(null);
    setResultsData(null);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F5] to-[#E8ECF4] p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-[#3B5999] to-[#5174C2] text-white rounded-t-lg">
            <CardTitle className="text-2xl md:text-3xl font-bold text-center">
              Булан Бичээч: Таны Контентын Туслах
            </CardTitle>
            <CardDescription className="text-gray-100 text-center">
              Доорх талбаруудыг бөглөж, хиймэл оюунаар нийтлэл бүтээлгээрэй!
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {appState === "input" && (
              <InputForm 
                onSubmit={handleFormSubmit} 
                setResultsData={setResultsData} // This will now set ResultsDisplayInput
                setAppState={setAppState}
              />
            )}
            {appState === "loading" && <LoadingIndicator formData={formData} />}
            {appState === "results" && resultsData && (
              <ResultsDisplay data={resultsData} onNewArticle={resetApp} />
            )}
            {appState === "error" && (
              <ErrorDisplay message={errorMessage} onRetry={resetApp} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;