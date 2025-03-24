"use client";

import React from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface Blog {
  id: string;
  image?: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
}

interface BlogModalProps {
  blog: Blog;
  isOpen: boolean;
  onClose: () => void;
}

const extractPlainText = (description: string) => {
  if (!description) return "No description available";
  try {
    const parsed = JSON.parse(description);
    if (parsed.type === "doc" && Array.isArray(parsed.content)) {
      return parsed.content
        .map(
          (block: {
            type: string;
            content?: { type: string; text?: string }[];
          }) => {
            if (block.type === "paragraph" && Array.isArray(block.content)) {
              return block.content
                .map((textBlock: { type: string; text?: string }) =>
                  textBlock.type === "text" && textBlock.text
                    ? textBlock.text
                    : ""
                )
                .join(" ");
            }
            return "";
          }
        )
        .join(" ");
    }
  } catch (e) {
    console.error("Error parsing description:", e);
  }
  return description;
};

export default function BlogModal({ blog, isOpen, onClose }: BlogModalProps) {
  if (!isOpen) return null;

  const plainTextDescription = extractPlainText(blog.description);

  return (
    <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-2">
      <div className="bg-black rounded-lg shadow-lg p-6 max-w-3xl w-full flex flex-col sm:flex-row gap-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-black dark:text-white"
        >
          <X size={24} />
        </button>

        {/* Image Section */}
        <div className="w-full sm:w-1/2">
          <Image
            src={blog.image || "/default-blog.jpg"}
            alt={blog.title}
            height={250}
            width={250}
            className="w-full h-auto object-cover rounded-md"
          />
        </div>

        {/* Content Section */}
        <div className="w-full sm:w-1/2 flex flex-col">
          <span className="text-green-600 dark:text-green-400 font-semibold uppercase mb-2">
            {blog.subtitle || "Uncategorized"}
          </span>
          <h2 className="text-xl font-bold text-black dark:text-white mb-3">
            {blog.title}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
            {plainTextDescription}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs mt-auto">
            {blog.date}
          </p>
        </div>
      </div>
    </div>
  );
}
