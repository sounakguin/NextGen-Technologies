"use client";

import React, { useState } from "react";
import createClient from "@/utils/supabase/client";
import RichTextEditor from "@/components/UI/Texteditor";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X } from "lucide-react";

interface AddPricingProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPricing({ onClose, onSuccess }: AddPricingProps) {
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleCreate = async () => {
    if (!name || !price || !billingCycle) {
      setError("Name, price, and billing cycle are required");
      return;
    }

    try {
      const { error } = await supabase.from("pricing_plans").insert({
        name,
        tag,
        description,
        price,
        billing_cycle: billingCycle,
        features,
      });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plan");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Add New Plan</h2>
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
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Tag (Optional)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
          <RichTextEditor
            initialContent={description}
            onChange={(content) => setDescription(content)}
          />
          <input
            type="number"
            placeholder="Price"
            value={price || ""}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Billing Cycle (e.g., per month)"
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
          <RichTextEditor
            initialContent={features.join("\n")}
            onChange={(content) => setFeatures(content.split("\n"))}
          />

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <CustomButton
            onClick={handleCreate}
            variant="primary"
            className="w-full"
          >
            Create Plan
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
