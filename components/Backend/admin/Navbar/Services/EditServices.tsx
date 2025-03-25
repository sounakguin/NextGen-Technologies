"use client";

import React, { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X, Trash } from "lucide-react";

interface EditServiceProps {
  service: {
    id: number;
    name: string;
    category_id: number;
    sub_services: {
      id: number;
      image: string;
      title: string;
      description: string;
      slug: string;
    }[];
  };
  onClose: () => void;
  onUpdate: () => void;
}

interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

export default function EditService({
  service,
  onClose,
  onUpdate,
}: EditServiceProps) {
  const [name, setName] = useState(service.name);
  const [categoryId, setCategoryId] = useState(service.category_id);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subServices, setSubServices] = useState(service.sub_services);
  const [errors, setErrors] = useState({
    name: "",
    category: "",
    subServices: "",
  });
  const [uploading, setUploading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*");
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data);
      }
    };

    fetchCategories();
  }, [supabase]);

  const validateInputs = () => {
    let valid = true;
    const newErrors = { name: "", category: "", subServices: "" };

    if (!name.trim()) {
      newErrors.name = "Name cannot be empty.";
      valid = false;
    }

    if (!categoryId) {
      newErrors.category = "Category is required.";
      valid = false;
    }

    if (subServices.length === 0) {
      newErrors.subServices = "At least one sub-service is required.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleUpdate = async () => {
    if (!validateInputs()) return;

    try {
      const { error: serviceError } = await supabase
        .from("services")
        .update({ name, category_id: categoryId })
        .eq("id", service.id);

      if (serviceError) throw serviceError;

      await Promise.all(
        subServices.map(async (subService) => {
          if (subService.id) {
            const { error: subServiceError } = await supabase
              .from("sub_services")
              .update(subService)
              .eq("id", subService.id);

            if (subServiceError) throw subServiceError;
          } else {
            const { error: subServiceError } = await supabase
              .from("sub_services")
              .insert([{ ...subService, service_id: service.id }]);

            if (subServiceError) throw subServiceError;
          }
        })
      );

      onUpdate();
      onClose();
    } catch (err) {
      console.error("Error updating service:", err);
    }
  };

  const handleAddSubService = () => {
    setSubServices([
      ...subServices,
      { id: 0, image: "", title: "", description: "", slug: "" },
    ]);
  };

  const handleDeleteSubService = (index: number) => {
    const updatedSubServices = subServices.filter((_, i) => i !== index);
    setSubServices(updatedSubServices);
  };

  const handleSubServiceChange = (
    index: number,
    field: "image" | "title" | "description" | "slug",
    value: string
  ) => {
    const updatedSubServices = [...subServices];
    updatedSubServices[index][field] = value;
    setSubServices(updatedSubServices);
  };

  const handleImageUpload = async (index: number, file: File) => {
    if (!file) return;

    setUploading(true);

    try {
      const filePath = `Navbar/Services/SubServicesIcons/${Date.now()}_${
        file.name
      }`;
      const { error } = await supabase.storage
        .from("Images")
        .upload(filePath, file);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from("Images")
        .getPublicUrl(filePath);

      handleSubServiceChange(index, "image", publicUrl.publicUrl);
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px]  h-[600px] overflow-y-scroll">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Edit Service</h2>
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
            <input
              type="text"
              placeholder="Enter service name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-2 border rounded-lg ${
                errors.name && "border-red-500"
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Category Field */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Category
            </label>
            <select
              value={categoryId || ""}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className={`w-full p-2 border rounded-lg ${
                errors.category && "border-red-500"
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-600 text-sm">{errors.category}</p>
            )}
          </div>

          {subServices.map((subService, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-gray-700 font-medium mb-1">
                  Sub-Service {index + 1}
                </label>
                <button
                  onClick={() => handleDeleteSubService(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(index, e.target.files[0]);
                    }
                  }}
                  className="w-full p-2 border rounded-lg"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter title"
                  value={subService.title}
                  onChange={(e) =>
                    handleSubServiceChange(index, "title", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  placeholder="Enter slug"
                  value={subService.slug}
                  onChange={(e) =>
                    handleSubServiceChange(index, "slug", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Enter description"
                  value={subService.description}
                  onChange={(e) =>
                    handleSubServiceChange(index, "description", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          ))}

          {errors.subServices && (
            <p className="text-red-600 text-sm">{errors.subServices}</p>
          )}

          <CustomButton
            onClick={handleAddSubService}
            variant="secondary"
            className="w-full"
          >
            Add Sub-Service
          </CustomButton>

          <CustomButton
            onClick={handleUpdate}
            variant="primary"
            className="w-full"
          >
            Update Service
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
