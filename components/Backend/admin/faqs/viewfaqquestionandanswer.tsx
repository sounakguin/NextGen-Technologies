"use client";

import React from "react";
import RichTextEditor from "@/components/UI/Texteditor";
import { X } from "lucide-react";

interface ViewFaqsQuestionAndAnswerProps {
  item: {
    question: string;
    answer: string;
  };
  onClose: () => void;
}

export default function ViewFaqsQuestionAndAnswer({
  item,
  onClose,
}: ViewFaqsQuestionAndAnswerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">FAQ Details</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">{item.question}</h3>
          <div className="prose max-w-full">
            <RichTextEditor initialContent={item.answer} readOnly={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
