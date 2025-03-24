"use client";

import React from "react";
import { X } from "lucide-react";
import RichTextEditor from "@/components/UI/Texteditor";

interface ViewtestimonialstextProps {
  item: {
    id: number;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
  };
  onClose: () => void;
}

export default function Viewtestimonialstext({
  item,
  onClose,
}: ViewtestimonialstextProps) {
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

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">{item.title}</h3>
          <RichTextEditor initialContent={item.description} readOnly={true} />
          <p className="text-sm text-gray-600">
            Created At: {new Date(item.created_at).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600">
            Updated At: {new Date(item.updated_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
