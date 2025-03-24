"use client";

import React from "react";
import { X } from "lucide-react";

interface ViewDesignServiceProps {
  service: {
    id: number;
    title: string;
    slug: string;
    description: string;
    monthly_plans: {
      id: number;
      title: string;
      description: string;
    }[];
  };
  onClose: () => void;
}

export default function ViewDesignService({
  service,
  onClose,
}: ViewDesignServiceProps) {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            View Design Service
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Title
            </label>
            <p className="w-full p-2 border rounded-lg bg-gray-100">
              {service.title}
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Slug</label>
            <p className="w-full p-2 border rounded-lg bg-gray-100">
              {service.slug}
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <p className="w-full p-2 border rounded-lg bg-gray-100">
              {service.description}
            </p>
          </div>

          {service.monthly_plans.map((plan, index) => (
            <div key={index} className="space-y-2">
              <label className="block text-gray-700 font-medium mb-1">
                Plan {index + 1}
              </label>
              <p className="w-full p-2 border rounded-lg bg-gray-100">
                {plan.title}
              </p>
              <p className="w-full p-2 border rounded-lg bg-gray-100">
                {plan.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
