"use client";

import React, { useState } from "react";
import Image from "next/image";
import BlogModal from "./blogmodal";

interface Blog {
  id: string;
  image?: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
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

export default function BlogCard({ blog }: { blog: Blog }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const plainTextDescription = extractPlainText(blog.description);

  return (
    <div className="flex w-11/12 mx-auto flex-col md:flex-row overflow-hidden rounded-xl border border-green-500/20 bg-[#0f120b] hover:border-green-500/40 transition-all">
      <div className="w-full md:w-2/5 h-56 md:h-auto relative">
        <Image
          src={blog.image || "/default-blog.jpg"}
          alt={blog.title}
          fill
          className="object-cover cursor-pointer"
          onClick={openModal}
        />
      </div>
      <div className="w-full md:w-3/5 p-4 flex flex-col justify-between">
        <div>
          <span className="text-green-500 text-xs font-semibold uppercase tracking-wider">
            {blog.subtitle || "Uncategorized"}
          </span>
          <h2 className="text-lg md:text-xl font-bold text-white mt-1">
            {blog.title}
          </h2>
          <p className="text-gray-400 text-sm mt-2 line-clamp-3">
            {plainTextDescription.slice(0, 150)}...
          </p>
        </div>
      </div>
      <BlogModal blog={blog} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
