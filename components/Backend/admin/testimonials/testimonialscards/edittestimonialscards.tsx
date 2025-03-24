"use client";

import React, { useState } from "react";
import createClient from "@/utils/supabase/client";
import RichTextEditor from "@/components/UI/Texteditor";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X } from "lucide-react";

interface EditTestimonialCardsProps {
  item: {
    id: number;
    title: string;
    website_name: string;
    image: string;
    description: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditTestimonialCards({
  item,
  onClose,
  onSuccess,
}: EditTestimonialCardsProps) {
  const [title, setTitle] = useState(item.title);
  const [websiteName, setWebsiteName] = useState(item.website_name);
  const [description, setDescription] = useState(item.description);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const uploadImage = async () => {
    if (!file) throw new Error("No file selected");

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `Testimonials/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("Images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = await supabase.storage
      .from("Images")
      .getPublicUrl(filePath);

    return urlData?.publicUrl;
  };

  const handleUpdate = async () => {
    if (!title || !websiteName || !description) {
      setError("Title, website name, and description are required");
      return;
    }

    try {
      let imageUrl = item.image;
      if (file) {
        imageUrl = await uploadImage();
      }

      const { error } = await supabase
        .from("testimonialscards")
        .update({
          title,
          website_name: websiteName,
          description,
          image: imageUrl,
        })
        .eq("id", item.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Edit Testimonial
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
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Website Name"
            value={websiteName}
            onChange={(e) => setWebsiteName(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
          <RichTextEditor
            initialContent={description}
            onChange={setDescription}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded-lg"
          />
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          <CustomButton
            onClick={handleUpdate}
            variant="primary"
            className="w-full"
          >
            Update Testimonial
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
