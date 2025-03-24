"use client";

import React, { useState } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import RichTextEditor from "@/components/UI/Texteditor";
import { X } from "lucide-react";

type AddWorkflowProps = {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowAdded: () => void;
};

export default function AddWorkflow({
  isOpen,
  onClose,
  onWorkflowAdded,
}: AddWorkflowProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
    const filePath = `About/Workflow/${fileName}`;

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
    if (!title || !description) {
      setError("Title and description are required");
      return;
    }

    try {
      const imageUrl = file ? await uploadImage() : null;

      const { error } = await supabase.from("aboutworkflow").insert({
        title,
        description,
        image: imageUrl,
      });

      if (error) throw error;

      onWorkflowAdded();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create Workflow"
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Add New Workflow
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
            onClick={handleCreate}
            variant="primary"
            className="w-full"
          >
            Create Workflow
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
