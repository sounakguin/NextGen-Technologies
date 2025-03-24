"use client";

import React, { useState } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import RichTextEditor from "@/components/UI/Texteditor";
import { X } from "lucide-react";

interface AddFaqsQuestionAndAnswerProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddFaqsQuestionAndAnswer({
  onClose,
  onSuccess,
}: AddFaqsQuestionAndAnswerProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleCreate = async () => {
    if (!question || !answer) {
      setError("Question and answer are required");
      return;
    }

    try {
      const { error } = await supabase
        .from("faqsquestionandanswer")
        .insert({ question, answer });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create FAQ");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Add New FAQ</h2>
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
            onClick={handleCreate}
            variant="primary"
            className="w-full"
          >
            Create FAQ
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
