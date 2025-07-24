import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const PostDetailHeader: React.FC = () => {
  return (
    <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-900">
        <ArrowLeft size={20} />
      </Button>
      <h1 className="text-gray-900 font-semibold">Post</h1>
      <div className="w-8"></div>
    </div>
  );
};
