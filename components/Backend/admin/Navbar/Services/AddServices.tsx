"use client";

import React, { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X, Trash } from "lucide-react";

interface AddServiceProps {
  onClose: () => void;
  onAdd: () => void;
}

interface SubService {
  image: File | null;
  title: string;
  description: string;
  slug: string;
}

export default function AddService({ onClose, onAdd }: AddServiceProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [errors, setErrors] = useState({
    name: "",
    category: "",
    subServices: "",
  });

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

  const handleCreate = async () => {
    if (!validateInputs()) return;

    try {
      // Insert the main service
      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .insert([{ name, category_id: categoryId }])
        .select();

      if (serviceError) {
        console.error("Error inserting service:", serviceError);
        throw serviceError;
      }

      const serviceId = serviceData[0].id;
      console.log("Service ID:", serviceId);

      // Upload images and insert sub-services
      await Promise.all(
        subServices.map(async (subService, index) => {
          let imageUrl = "";

          // Upload the image to Supabase Storage if it exists
          if (subService.image) {
            const filePath = `Navbar/Services/SubServicesIcons/${Date.now()}_${
              subService.image.name
            }`;
            const { error: uploadError } = await supabase.storage
              .from("Images")
              .upload(filePath, subService.image);

            if (uploadError) {
              console.error("Error uploading image:", uploadError);
              throw uploadError;
            }

            // Get the public URL of the uploaded image
            const { data: urlData } = supabase.storage
              .from("Images")
              .getPublicUrl(filePath);

            imageUrl = urlData.publicUrl;
            console.log("Image URL for sub-service", index, ":", imageUrl);
          }

          // Insert the sub-service with the image URL
          const { error: subServiceError } = await supabase
            .from("sub_services")
            .insert([
              {
                title: subService.title,
                description: subService.description,
                image: imageUrl,
                service_id: serviceId,
                slug:
                  subService.slug ||
                  subService.title.toLowerCase().replace(/\s+/g, "-"), // Generate slug from title if not provided
              },
            ]);

          if (subServiceError) {
            console.error("Error inserting sub-service:", subServiceError);
            throw subServiceError;
          }

          console.log("Sub-service", index, "inserted successfully");
        })
      );

      onAdd();
      onClose();
    } catch (err) {
      console.error("Error creating service:", err);
    }
  };

  const handleAddSubService = () => {
    setSubServices([
      ...subServices,
      { image: null, title: "", description: "", slug: "" },
    ]);
  };

  const handleSubServiceChange = (
    index: number,
    field: keyof SubService,
    value: string | File
  ) => {
    const updatedSubServices = [...subServices];
    updatedSubServices[index][field] = value as never; // Type assertion to handle both string and File
    setSubServices(updatedSubServices);
  };

  const handleImageUpload = (index: number, file: File) => {
    handleSubServiceChange(index, "image", file);
  };

  const handleDeleteSubService = (index: number) => {
    const updatedSubServices = subServices.filter((_, i) => i !== index);
    setSubServices(updatedSubServices);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px] h-[500px] overflow-y-scroll">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Add New Service
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name Field */}
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

          {/* Sub-Services Fields */}
          {subServices.map((subService, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-gray-700 font-medium mb-1">
                  Sub-Service {index + 1}
                </label>
                <button
                  onClick={() => handleDeleteSubService(index)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <Trash size={18} />
                </button>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(index, e.target.files[0]);
                    }
                  }}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {/* Title */}
              <input
                type="text"
                placeholder="Enter title"
                value={subService.title}
                onChange={(e) =>
                  handleSubServiceChange(index, "title", e.target.value)
                }
                className="w-full p-2 border rounded-lg"
              />

              {/* Slug */}
              <input
                type="text"
                placeholder="Enter slug"
                value={subService.slug}
                onChange={(e) =>
                  handleSubServiceChange(index, "slug", e.target.value)
                }
                className="w-full p-2 border rounded-lg"
              />

              {/* Description */}
              <textarea
                placeholder="Enter description"
                value={subService.description}
                onChange={(e) =>
                  handleSubServiceChange(index, "description", e.target.value)
                }
                className="w-full p-2 border rounded-lg"
              />
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

          {/* Submit Button */}
          <CustomButton
            onClick={handleCreate}
            variant="primary"
            className="w-full"
          >
            Create Service
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
