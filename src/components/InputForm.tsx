// src/components/InputForm.tsx

import React from "react"; // Removed useState as it's not used in this simplified version
import { useForm } from "react-hook-form";
import { FormData, ResultsDisplayInput } from "@/types/article"; // Removed unused types
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Label is used for the new text sections
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";
// Removed Upload and toast as they were part of the debug functionality

interface InputFormProps {
  onSubmit: (data: FormData) => void;
  // setResultsData and setAppState might not be needed if debug mode is fully removed from this component's direct responsibility
  // If Index.tsx handles all state changes based on onSubmit, these could be optional or removed
  setResultsData?: (data: ResultsDisplayInput) => void;
  setAppState?: (state: "input" | "loading" | "results" | "error") => void;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit }) => { // Removed unused props

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

  return (
    // Added a root div to contain the new informational text and the form
    <div className="space-y-8"> {/* Added space-y for overall vertical spacing */}
      {/* New Informational Sections */}
      <div className="text-left space-y-6 p-4 md:p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-[#3B5999] mb-3">
            Хиймэл оюуны агент гэж юу вэ?
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            Хиймэл оюуны агент нь тодорхой даалгавруудыг бие даан гүйцэтгэх, орчноосоо мэдээлэл хүлээн авч, түүндээ үндэслэн шийдвэр гаргах чадвартай ухаалаг програм юм. Энгийнээр хэлбэл, агент нь таны өмнөөс судалгаа хийх, мэдээлэл боловсруулах, эсвэл ямар нэгэн үйлдлийг хийх дижитал туслах гэж ойлгож болно.
          </p>
        </div>
        <div>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            Манай <strong className="font-semibold text-[#3B5999]">Булан Бичээч</strong> агент нь Google-ийн хамгийн сүүлийн үеийн дэвшилтэт хиймэл оюуны загварууд, гүнзгийрүүлсэн судалгаа хийхэд зориулсан Tavily Tool, болон өнгө аяс, агуулгад тохирсон нүүр зураг бүтээхэд ChatGPT-г ашиглан ажилладаг.
          </p>
        </div>
      </div>

      {/* Existing Form */}
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
    </div>
  );
};

export default InputForm;