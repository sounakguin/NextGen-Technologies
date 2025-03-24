"use client";

import React from "react";
import RichTextEditor from "@/components/UI/Texteditor";
import { X } from "lucide-react";

interface ViewPricingProps {
  plan: {
    id: number;
    name: string;
    tag: string;
    description: string;
    price: number;
    billing_cycle: string;
    features: string[];
    created_at: string;
  };
  onClose: () => void;
}

export default function ViewPricing({ plan, onClose }: ViewPricingProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Plan Details</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">{plan.name}</h3>
          <p className="text-gray-600">{plan.tag}</p>
          <RichTextEditor initialContent={plan.description} readOnly={true} />
          <p className="text-gray-800">Price: ${plan.price}</p>
          <p className="text-gray-800">Billing Cycle: {plan.billing_cycle}</p>
          <RichTextEditor
            initialContent={plan.features.join("\n")}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
}
