"use client";

import React from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ViewtemplatesProps {
  item: {
    id: number;
    image: string;
  };
  onClose: () => void;
}

export default function Viewtemplates({ item, onClose }: ViewtemplatesProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">View Image</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-center">
          <Image
            src={item.image || "/placeholder.jpg"}
            alt="Awards image"
            width={400}
            height={400}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
