"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function FAQList({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const extractPlainText = (description: string) => {
    if (!description) return "No description available";

    try {
      const parsed = JSON.parse(description);
      if (parsed.type === "doc" && Array.isArray(parsed.content)) {
        return parsed.content
          .map(
            (
              block: { type: string; content: { text: string }[] } // replaced any[] with { text: string }[]
            ) =>
              block.type === "paragraph"
                ? block.content
                    .map((textBlock: { text: string }) => textBlock.text)
                    .join(" ")
                : ""
          )
          .join(" ");
      }
    } catch (e) {
      console.error("Error parsing description:", e);
    }
    return description;
  };

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Frequently Asked Questions
      </h1>
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.id}
              className={`p-6 rounded-lg shadow-md transition-all ${
                isOpen ? "bg-[#B4FFAE]" : "bg-white"
              }`}
            >
              <button
                className="flex items-center justify-between w-full text-left"
                onClick={() => toggleFAQ(index)}
              >
                <h2 className="text-xl font-semibold">
                  {String(index + 1).padStart(2, "0")}. {faq.question}
                </h2>
                {isOpen ? <Minus size={24} /> : <Plus size={24} />}
              </button>
              {isOpen && (
                <p className="mt-4 text-gray-700">
                  {extractPlainText(faq.answer)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
