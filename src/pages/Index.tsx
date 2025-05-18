
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import InputForm from "@/components/InputForm";
import LoadingIndicator from "@/components/LoadingIndicator";
import ResultsDisplay from "@/components/ResultsDisplay";
import ErrorDisplay from "@/components/ErrorDisplay";
import { ArticleData, FormData } from "@/types/article";

type AppState = "input" | "loading" | "results" | "error";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("input");
  const [formData, setFormData] = useState<FormData | null>(null);
  const [resultsData, setResultsData] = useState<ArticleData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFormSubmit = async (data: FormData) => {
    setFormData(data);
    setAppState("loading");

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

      const responseData = await response.json();

      if (responseData.status === "error") {
        setErrorMessage(responseData.errorMessage || "Тодорхойгүй алдаа");
        setAppState("error");
        return;
      }

      setResultsData(responseData);
      setAppState("results");
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("Серверт хандахад алдаа гарлаа. Дахин оролдоно уу.");
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
                setResultsData={setResultsData}
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
