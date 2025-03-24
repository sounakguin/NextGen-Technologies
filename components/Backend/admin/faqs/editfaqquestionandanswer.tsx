"use client";

import React, { useState } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import RichTextEditor from "@/components/UI/Texteditor";
import { X } from "lucide-react";

interface EditFaqsQuestionAndAnswerProps {
  item: {
    id: number;
    question: string;
    answer: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditFaqsQuestionAndAnswer({
  item,
  onClose,
  onSuccess,
}: EditFaqsQuestionAndAnswerProps) {
  const [question, setQuestion] = useState(item.question);
  const [answer, setAnswer] = useState(item.answer);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleUpdate = async () => {
    if (!question || !answer) {
      setError("Question and answer are required");
      return;
    }

    try {
      const { error } = await supabase
        .from("faqsquestionandanswer")
        .update({ question, answer })
        .eq("id", item.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update FAQ");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Edit FAQ</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />

          <RichTextEditor initialContent={answer} onChange={setAnswer} />

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <CustomButton
            onClick={handleUpdate}
            variant="primary"
            className="w-full"
          >
            Update FAQ
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
