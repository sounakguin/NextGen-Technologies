"use client";

import React from "react";
import { X } from "lucide-react";

interface ViewServiceProps {
  service: {
    id: number;
    name: string;
    sub_services: {
      id: number;
      image: string;
      title: string;
      description: string;
    }[];
  };
  onClose: () => void;
}

export default function ViewService({ service, onClose }: ViewServiceProps) {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">View Service</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <p className="w-full p-2 border rounded-lg bg-gray-100">
              {service.name}
            </p>
          </div>

          {service.sub_services.map((subService, index) => (
            <div key={index} className="space-y-2">
              <label className="block text-gray-700 font-medium mb-1">
                Sub-Service {index + 1}
              </label>
              <img
                src={subService.image}
                alt={subService.title}
                className="w-full h-32 object-cover rounded-lg"
              />
              <p className="w-full p-2 border rounded-lg bg-gray-100">
                {subService.title}
              </p>
              <p className="w-full p-2 border rounded-lg bg-gray-100">
                {subService.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
