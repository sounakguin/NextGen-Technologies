"use client";

import React, { useState } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import RichTextEditor from "@/components/UI/Texteditor";
import { X } from "lucide-react";

interface AddAboutTextProps {
  onClose: () => void;
  onAdd: () => void;
}

export default function AddAboutText({ onClose, onAdd }: AddAboutTextProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState({
    title: "",
    subtitle: "",
    description: "",
  });

  const supabase = createClient();

  const validateInputs = () => {
    let valid = true;
    const newErrors = { title: "", subtitle: "", description: "" };

    if (!/^[A-Za-z\s]{3,50}$/.test(title)) {
      newErrors.title =
        "Title must be 3-50 characters and contain only letters.";
      valid = false;
    }

    if (!/^[A-Za-z\s-]{3,100}$/.test(subtitle)) {
      newErrors.subtitle =
        "Subtitle must be 3-100 characters and contain only letters, spaces, or hyphens.";
      valid = false;
    }

    if (!description.trim()) {
      newErrors.description = "Description cannot be empty.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleCreate = async () => {
    if (!validateInputs()) return;

    try {
      const { error } = await supabase.from("abouttext").insert({
        title,
        subtitle,
        description,
      });

      if (error) throw error;

      // Clear form fields on successful submission
      setTitle("");
      setSubtitle("");
      setDescription("");
      setErrors({ title: "", subtitle: "", description: "" });

      onAdd();
      onClose();
    } catch (err) {
      console.error("Error creating item:", err);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
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
          {/* Title Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-2 border rounded-lg ${
                errors.title && "border-red-500"
              }`}
            />
            {errors.title && (
              <p className="text-red-600 text-sm">{errors.title}</p>
            )}
          </div>

          {/* Subtitle Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Subtitle
            </label>
            <input
              type="text"
              placeholder="Enter subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className={`w-full p-2 border rounded-lg ${
                errors.subtitle && "border-red-500"
              }`}
            />
            {errors.subtitle && (
              <p className="text-red-600 text-sm">{errors.subtitle}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <RichTextEditor
              initialContent={description}
              onChange={setDescription}
            />
            {errors.description && (
              <p className="text-red-600 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Submit Button */}
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
