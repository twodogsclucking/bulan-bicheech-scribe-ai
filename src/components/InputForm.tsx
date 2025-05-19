import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FormData, ArticleData, NestedJsonResponse } from "@/types/article";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";
import { Download, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  setResultsData?: (data: ArticleData) => void;
  setAppState?: (state: "input" | "loading" | "results" | "error") => void;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, setResultsData, setAppState }) => {
  const [debugMode, setDebugMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      garchig: "",
      sudalgaaniiChiglel: "",
      niitleliinUrt: "1000 үг",
      niitleliinUnguAyas: "Мэдээлэлд Суурилсан",
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDebugDisplay = () => {
    if (!selectedFile || !setResultsData || !setAppState) {
      toast({
        title: "Алдаа",
        description: "JSON файл сонгоно уу эсвэл шаардлагатай функцүүд алга байна",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        if (e.target?.result) {
          let jsonContent = e.target.result as string;
          
          // Log the raw content for debugging
          console.log("Raw file content:", jsonContent);
          
          // Try to parse the JSON
          let parsedData;
          try {
            parsedData = JSON.parse(jsonContent);
            console.log("Parsed data:", parsedData);
          } catch (parseError) {
            console.error("JSON parsing error:", parseError);
            throw new Error("JSON файл буруу форматтай байна.");
          }
          
          // Handle the array wrapping if present
          if (Array.isArray(parsedData)) {
            console.log("JSON is an array, taking first item");
            if (parsedData.length === 0) {
              throw new Error("JSON массив хоосон байна.");
            }
            parsedData = parsedData[0];
          }
          
          // Check if we have the nested structure with json property
          const nestedData = parsedData as NestedJsonResponse;
          if (nestedData.json && nestedData.json.content && nestedData.json.coverImage) {
            console.log("Found nested json structure");
            
            // Convert to our ArticleData format
            const articleData: ArticleData = {
              status: "success",
              content: nestedData.json.content,
              coverImage: nestedData.json.coverImage
            };
            
            // Set results data and change app state
            setResultsData(articleData);
            setAppState("results");
            return;
          }
          
          // If not nested, try to use it directly if it matches ArticleData
          const directData = parsedData as ArticleData;
          if (
            (directData.content || directData.generatedTitle) && 
            (directData.coverImage || directData.imageBase64)
          ) {
            console.log("Using direct data structure");
            setResultsData(directData);
            setAppState("results");
            return;
          }
          
          throw new Error("JSON бүтэц буруу байна. Шаардлагатай талбарууд алга байна.");
        }
      } catch (error) {
        console.error("JSON файл уншихад алдаа гарлаа:", error);
        toast({
          title: "JSON алдаа",
          description: error instanceof Error ? error.message : "JSON файл уншихад алдаа гарлаа",
          variant: "destructive",
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "Файл алдаа",
        description: "Файл уншихад алдаа гарлаа",
        variant: "destructive",
      });
    };

    reader.readAsText(selectedFile);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="garchig"
            rules={{ required: "Гарчиг оруулна уу" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#333333] font-medium">Гарчиг</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Нийтлэлийн гарчиг"
                    className="border-[#3B5999]/30 focus:border-[#3B5999]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sudalgaaniiChiglel"
            rules={{ required: "Судалгааны чиглэл оруулна уу" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#333333] font-medium">Судалгааны чиглэл</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Нийтлэлийн агуулгын чиглэл, судлах сэдэв"
                    className="min-h-[100px] border-[#3B5999]/30 focus:border-[#3B5999]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="niitleliinUrt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#333333] font-medium">Нийтлэлийн Урт</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-[#3B5999]/30 focus:border-[#3B5999]">
                        <SelectValue placeholder="Урт сонгох" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1000 үг">1000 үг</SelectItem>
                      <SelectItem value="1500 үг">1500 үг</SelectItem>
                      <SelectItem value="2000 үг">2000 үг</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="niitleliinUnguAyas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#333333] font-medium">Нийтлэлийн Өнгө Аяс</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-[#3B5999]/30 focus:border-[#3B5999]">
                        <SelectValue placeholder="Өнгө аяс сонгох" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Албан Ёсны">Албан Ёсны</SelectItem>
                      <SelectItem value="Мэдээлэлд Суурилсан">Мэдээлэлд Суурилсан</SelectItem>
                      <SelectItem value="Найрсаг Энгийн">Найрсаг Энгийн</SelectItem>
                      <SelectItem value="Сонирхол Татахуйц">Сонирхол Татахуйц</SelectItem>
                      <SelectItem value="Ятгасан">Ятгасан</SelectItem>
                      <SelectItem value="Хошин">Хошин</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full py-6 text-lg bg-gradient-to-r from-[#FFD700] to-[#FFA07A] hover:from-[#FFD700]/90 hover:to-[#FFA07A]/90 text-[#333333] font-bold shadow-lg"
          >
            Нийтлэл Үүсгэх
          </Button>
        </form>
      </Form>

      {/* Debug/Test Mode Toggle */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <Label htmlFor="debug-toggle" className="font-medium text-[#333333]">
            Дебаг/Тест горим
          </Label>
          <div className="relative inline-block w-12 align-middle select-none">
            <input
              type="checkbox"
              id="debug-toggle"
              checked={debugMode}
              onChange={() => setDebugMode(!debugMode)}
              className="sr-only"
            />
            <div
              className={`block w-12 h-7 rounded-full ${
                debugMode ? "bg-[#3B5999]" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${
                debugMode ? "transform translate-x-5" : ""
              }`}
            ></div>
          </div>
        </div>

        {debugMode && (
          <div className="p-4 border border-[#1EAEDB]/30 rounded-lg bg-[#F5F5F5]">
            <p className="text-sm text-[#333333] mb-4">
              JSON файл оруулж, шууд харахын тулд энэ хэсгийг ашиглаж болно.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="json-file" className="text-[#333333] font-medium block mb-2">
                  JSON файл сонгох
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="json-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="border-[#3B5999]/30 focus:border-[#3B5999]"
                  />
                  <span className="text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : "Файл сонгоогүй байна"}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleDebugDisplay}
                disabled={!selectedFile}
                className="flex items-center gap-2 bg-[#1EAEDB] hover:bg-[#1EAEDB]/90 text-white"
              >
                <Upload size={18} /> JSON Файлаас Харуулах
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputForm;
