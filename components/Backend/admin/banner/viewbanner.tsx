"use client";

import React from "react";
import Image from "next/image";
import RichTextEditor from "@/components/UI/Texteditor";
import { X } from "lucide-react";

type ViewBannerProps = {
  isOpen: boolean;
  onClose: () => void;
  banner: {
    title: string;
    description: string;
    image: string;
  };
};

export default function ViewBanner({
  isOpen,
  onClose,
  banner,
}: ViewBannerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Banner Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{banner.title}</h3>
            <div className="prose max-w-full">
              <RichTextEditor
                initialContent={banner.description}
                readOnly={true}
              />
            </div>
          </div>

          <div className="sm:w-1/3">
            <Image
              src={banner.image || "/placeholder.jpg"}
              alt="Banner image"
              width={400}
              height={400}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
