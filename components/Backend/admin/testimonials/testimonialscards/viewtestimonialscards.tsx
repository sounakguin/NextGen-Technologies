"use client";

import React from "react";
import RichTextEditor from "@/components/UI/Texteditor";

import { X } from "lucide-react";
import Image from "next/image";

interface ViewTestimonialCardsProps {
  item: {
    title: string;
    website_name: string;
    image: string;
    description: string;
  };
  onClose: () => void;
}

export default function ViewTestimonialCards({
  item,
  onClose,
}: ViewTestimonialCardsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Testimonial Details
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
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600 mb-4">{item.website_name}</p>
            <div className="prose max-w-full">
              <RichTextEditor
                initialContent={item.description}
                readOnly={true}
              />
            </div>
          </div>

          <div className="sm:w-1/3">
            <Image
              src={item.image || "/placeholder.jpg"}
              alt="Testimonial image"
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
