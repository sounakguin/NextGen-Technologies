"use client";

import React, { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import RichTextEditor from "@/components/UI/Texteditor";
import { X } from "lucide-react";

type BlogDetail = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  created_at: string;
  updated_at: string;
};

interface EditBlogDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  item: BlogDetail | null;
  onEdit: () => void;
}

export default function EditBlogDetails({
  isOpen,
  onClose,
  item,
  onEdit,
}: EditBlogDetailsProps) {
  const [title, setTitle] = useState(item?.title || "");
  const [subtitle, setSubtitle] = useState(item?.subtitle || "");
  const [description, setDescription] = useState(item?.description || "");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setSubtitle(item.subtitle);
      setDescription(item.description);
    }
  }, [item]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const uploadImage = async () => {
    if (!file) throw new Error("No file selected");

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `Blog/${fileName}`;

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
    if (!item) return;

    try {
      let imageUrl = item.image;
      if (file) {
        imageUrl = await uploadImage();
      }

      const { error } = await supabase
        .from("blogdetails")
        .update({ title, subtitle, description, image: imageUrl })
        .eq("id", item.id);

      if (error) throw error;

      onEdit();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Edit Blog</h2>
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
          <RichTextEditor
            initialContent={description}
            onChange={setDescription}
          />
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
            onClick={handleUpdate}
            variant="primary"
            className="w-full"
          >
            Update Blog
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
