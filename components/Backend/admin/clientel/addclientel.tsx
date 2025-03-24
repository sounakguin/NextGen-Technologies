"use client";

import React, { useState } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X } from "lucide-react";

interface AddclientelProps {
  onClose: () => void;
  fetchItems: () => void;
}

export default function Addclientel({ onClose, fetchItems }: AddclientelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const uploadImage = async () => {
    if (!file) throw new Error("No file selected");

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `Clientel/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("Images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = await supabase.storage
      .from("Images")
      .getPublicUrl(filePath);

    return urlData?.publicUrl;
  };

  const handleCreate = async () => {
    if (!file) {
      setError("Please select an image");
      return;
    }

    try {
      const imageUrl = await uploadImage();

      const { error } = await supabase.from("clientel").insert({
        image: imageUrl,
      });

      if (error) throw error;

      onClose();
      fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Add New Image
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded-lg"
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
            Add Image
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
