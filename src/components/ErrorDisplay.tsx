
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
      <div className="bg-[#FF6F61]/10 p-4 rounded-full">
        <AlertCircle className="h-16 w-16 text-[#FF6F61]" />
      </div>
      
      <h2 className="text-2xl font-bold text-[#333333]">Уучлаарай, алдаа гарлаа!</h2>
      
      <p className="text-[#333333]/80 max-w-md">{message}</p>
      
      <Button 
        onClick={onRetry} 
        className="mt-6 bg-[#3B5999] hover:bg-[#3B5999]/90 px-8 py-6 text-white font-medium"
      >
        Дахин Оролдох
      </Button>
    </div>
  );
};

export default ErrorDisplay;
