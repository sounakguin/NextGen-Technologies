"use client";

import React from "react";
import RichTextEditor from "@/components/UI/Texteditor";
import { X } from "lucide-react";

interface ViewAboutTextProps {
  item: {
    title: string;
    subtitle: string;
    description: string;
  };
  onClose: () => void;
}

export default function ViewAboutText({ item, onClose }: ViewAboutTextProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Item Details</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <h4 className="text-lg font-semibold mb-2">{item.subtitle}</h4>
            <div className="prose max-w-full">
              <RichTextEditor
                initialContent={item.description}
                readOnly={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
