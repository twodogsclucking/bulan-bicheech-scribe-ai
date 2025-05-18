
import React from "react";
import { useForm } from "react-hook-form";
import { FormData } from "@/types/article";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FormControl, FormField, FormItem, FormLabel, FormMessage, Form } from "@/components/ui/form";

interface InputFormProps {
  onSubmit: (data: FormData) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit }) => {
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
  );
};

export default InputForm;
