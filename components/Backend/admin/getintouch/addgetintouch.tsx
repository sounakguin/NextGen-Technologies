"use client";

import React, { useState } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X } from "lucide-react";

interface AddgetintouchProps {
  onClose: () => void;
  onRefresh: () => void;
}

export default function Addgetintouch({
  onClose,
  onRefresh,
}: AddgetintouchProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleCreate = async () => {
    if (!title || !subtitle) {
      setError("Title and subtitle are required");
      return;
    }

    try {
      const { error } = await supabase
        .from("getintouch")
        .insert({ title, subtitle });

      if (error) throw error;

      onRefresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Add New Item</h2>
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
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <CustomButton
            onClick={handleCreate}
            variant="primary"
            className="w-full"
          >
            Create Item
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
