import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FormData } from "@/types/article";
import { AlertTriangle } from "lucide-react"; // Анхааруулгынไอคอน нэмлээ

interface LoadingIndicatorProps {
  formData: FormData | null;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ formData }) => {
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const loadingTexts = [
    "Хиймэл оюун маань кофегоо ууж байна...",
    "Таны захиалгаар шилдэг үгсийг түүж байна...",
    "Битгий санаа зов, бараг л болчихлоо! (Магадгүй)",
    "Нэг, хоёр, гурав... Бичээч ажиллаж байна!",
    "Таны нийтлэлийн санаанууд 'оргилдоо' хүрч байна!",
    "Үсгүүдийг цуглуулж байна, тэд маш жижигхэн учраас тэвчээртэй байна уу...",
    "Таны нийтлэлийг угаан цэвэрлэж байна...",
    "Санаануудыг нэхэж байгаа тул түр хүлээнэ үү...",
    "Хэлний яргуй нь хэлний гоё үгсийг түүж байна...",
    "Үгсийн хаан нь таны нийтлэлийг шалгаж байна...",
    "Энэ мөчид санаануудын оргил үед хүрч байна...",
    "Шинэ шинэлэг үгсийг хуримтлуулж байна...",
    "Нийтлэлийн заазууруудыг нягталж байна...",
    "Эрдмийн далай баахан гүн шүү...",
    "Үгийн омог хүчийг туршиж байна...",
    "Оюуны тоосоо сорж байна...",
    "Үгүүд эгнээндээ жагсаж байна...",
    "Монгол хэлний гоёмсог байдлыг нэмж байна...",
    "Зохиолч роботууд маань зөвлөлдөж байна...",
    "Үгсийн орой дээр урлагийн цэцэг дэлгэрч байна...",
    "Сэдвээ тунгаан бодож байна, тархи нь халж байна...",
    "Үгсээ тойрон эргэлдүүлж байгаа нь үнэхээр гайхалтай!",
    "Таны нийтлэл удахгүй төрөх гэж байна...",
    "Хуудас хуудсаар үгийн мэргэн чанарыг нэмж байна...",
    "Санааны оч асааж байна, яаралтай бус...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingTextIndex((prevIndex) =>
        (prevIndex + 1) % loadingTexts.length
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [loadingTexts.length]); // loadingTexts.length нэмэгдсэн, учир нь useEffect дотор ашиглагдаж буй гадаад хувьсагч

  return (
    <div className="flex flex-col items-center space-y-8 py-6">
      <h2 className="text-xl font-medium text-[#3B5999] text-center px-4">
        {formData ? `"${formData.garchig}" сэдэвт нийтлэл бэлтгэгдэж байна...` : "Таны нийтлэл бэлтгэгдэж байна..."}
      </h2>

      <div className="w-24 h-24 relative">
        <div className="absolute inset-0 rounded-full border-4 border-[#3B5999]/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-[#3B5999] animate-spin"></div>
      </div>

      <div className="text-center h-16 flex items-center justify-center px-4">
        <p className="text-lg text-[#333333] animate-pulse transition-all duration-500">
          {loadingTexts[loadingTextIndex]}
        </p>
      </div>

      {/* --- Шинэ Анхааруулгын Хэсэг --- */}
      <div className="w-full max-w-lg p-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-md shadow-lg mx-4">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 mr-3 text-red-600 shrink-0" />
          <div>
            <p className="font-bold text-base">АНХААРУУЛГА</p>
            <p className="text-sm mt-1">
              Нийтлэл үүсгэх явц дуустал цонхыг хаах, хуудсыг дахин ачааллахгүй байхыг хүсье. Эс бөгөөс таны үр дүн алдагдаж болзошгүй.
            </p>
          </div>
        </div>
      </div>
      {/* --- Анхааруулгын Хэсэг Дууссан --- */}

      <div className="space-y-3 w-full max-w-md px-4">
        <Skeleton className="h-4 w-3/4 mx-auto bg-[#3B5999]/10" />
        <Skeleton className="h-4 w-full mx-auto bg-[#3B5999]/10" />
        <Skeleton className="h-4 w-5/6 mx-auto bg-[#3B5999]/10" />
      </div>

      <div className="border border-[#3B5999]/20 rounded-lg p-4 bg-[#F5F5F5] mt-4 mx-4 max-w-lg w-full">
        <p className="text-[#333333]/80 text-sm text-center">
          Энэ нь ойролцоогоор 5-7 минут үргэлжилж магадгүй шүү...
        </p>
      </div>
    </div>
  );
};

export default LoadingIndicator;