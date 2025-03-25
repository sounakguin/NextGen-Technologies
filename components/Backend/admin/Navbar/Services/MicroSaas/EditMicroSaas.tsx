"use client";

import React, { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X, Trash } from "lucide-react";
import RichTextEditor from "@/components/UI/Texteditor";

interface EditMicroSaasProps {
  onClose: () => void;
  onUpdate: () => void;
  microSaasId: number;
}

interface Service {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface MicroSaasTemplateDetail {
  id?: number;
  name: string;
  category_ids: number[];
  thumbnail: string;
  price: number;
  preview_link: string;
  image_path?: string;
}

export default function EditMicroSaas({
  onClose,
  onUpdate,
  microSaasId,
}: EditMicroSaasProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [templates, setTemplates] = useState<MicroSaasTemplateDetail[]>([]);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    service: "",
    slug: "",
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch services and categories
        const { data: servicesData } = await supabase
          .from("services")
          .select("id, name");
        const { data: categoriesData } = await supabase
          .from("microsaas_categories")
          .select("id, name");

        setServices(servicesData || []);
        setCategories(categoriesData || []);

        // Fetch existing micro SaaS data
        const { data: microSaasData } = await supabase
          .from("micro_saas")
          .select("*")
          .eq("id", microSaasId)
          .single();

        if (microSaasData) {
          setTitle(microSaasData.title);
          setDescription(microSaasData.description);
          setSlug(microSaasData.slug);
          setSelectedServiceId(microSaasData.service_id);

          // Fetch templates with their categories
          const { data: templatesData } = await supabase
            .from("micro_saas_template")
            .select("*")
            .eq("micro_saas_id", microSaasId);

          if (templatesData) {
            const templatesWithCategories = await Promise.all(
              templatesData.map(async (template) => {
                const { data: categoryRelations } = await supabase
                  .from("micro_saas_category_relations")
                  .select("category_id")
                  .eq("template_id", template.id);

                return {
                  ...template,
                  category_ids:
                    categoryRelations?.map((r) => r.category_id) || [],
                };
              })
            );
            setTemplates(templatesWithCategories);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [microSaasId, supabase]);

  const validateInputs = () => {
    let valid = true;
    const newErrors = { title: "", description: "", service: "", slug: "" };

    if (!title.trim()) {
      newErrors.title = "Title cannot be empty.";
      valid = false;
    }

    if (!description.trim()) {
      newErrors.description = "Description cannot be empty.";
      valid = false;
    }

    if (!selectedServiceId) {
      newErrors.service = "Please select a service.";
      valid = false;
    }

    if (!slug.trim()) {
      newErrors.slug = "Slug cannot be empty.";
      valid = false;
    } else if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(slug)) {
      newErrors.slug = "Slug must be in a valid format (e.g., 'example-slug').";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const validateTemplates = () => {
    if (templates.length === 0) {
      alert("Please add at least one template.");
      return false;
    }

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      if (!template.name) {
        alert(`Template ${i + 1}: Name is required.`);
        return false;
      }
      if (template.category_ids.length === 0) {
        alert(`Template ${i + 1}: Please select at least one category.`);
        return false;
      }
      if (!template.price) {
        alert(`Template ${i + 1}: Price is required.`);
        return false;
      }
      if (!template.preview_link) {
        alert(`Template ${i + 1}: Preview link is required.`);
        return false;
      }
    }
    return true;
  };

  const handleTemplateChange = (
    index: number,
    field: keyof MicroSaasTemplateDetail,
    value: string | number | number[]
  ) => {
    const updatedTemplates = [...templates];
    updatedTemplates[index] = {
      ...updatedTemplates[index],
      [field]: value,
    };
    setTemplates(updatedTemplates);
  };

  const handleAddTemplate = () => {
    setTemplates([
      ...templates,
      {
        name: "",
        category_ids: [],
        thumbnail: "",
        price: 0,
        preview_link: "",
      },
    ]);
  };

  const handleImageUpload = async (index: number, file: File) => {
    const filePath = `Navbar/Services/MicroSaasApp/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("Images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Error uploading image:", error);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("Images")
      .getPublicUrl(filePath);

    const updatedTemplates = [...templates];
    updatedTemplates[index].image_path = filePath;
    updatedTemplates[index].thumbnail = publicUrlData.publicUrl;
    setTemplates(updatedTemplates);
  };

  const handleUpdate = async () => {
    if (!validateInputs() || !validateTemplates()) return;

    try {
      // Update micro SaaS
      const { error: microSaasError } = await supabase
        .from("micro_saas")
        .update({ title, description, service_id: selectedServiceId, slug })
        .eq("id", microSaasId);

      if (microSaasError) throw microSaasError;

      // Update templates
      for (const template of templates) {
        if (template.id) {
          // Update existing template
          const { error: templateError } = await supabase
            .from("micro_saas_template")
            .update({
              name: template.name,
              thumbnail: template.thumbnail,
              price: template.price,
              preview_link: template.preview_link,
            })
            .eq("id", template.id);

          if (templateError) throw templateError;

          // Update categories
          await supabase
            .from("micro_saas_category_relations")
            .delete()
            .eq("template_id", template.id);

          for (const categoryId of template.category_ids) {
            const { error: categoryError } = await supabase
              .from("micro_saas_category_relations")
              .insert([{ template_id: template.id, category_id: categoryId }]);

            if (categoryError) throw categoryError;
          }
        } else {
          // Create new template
          const { data: newTemplate, error: templateError } = await supabase
            .from("micro_saas_template")
            .insert([
              {
                micro_saas_id: microSaasId,
                name: template.name,
                thumbnail: template.thumbnail,
                price: template.price,
                preview_link: template.preview_link,
              },
            ])
            .select()
            .single();

          if (templateError) throw templateError;

          // Add categories for new template
          for (const categoryId of template.category_ids) {
            const { error: categoryError } = await supabase
              .from("micro_saas_category_relations")
              .insert([
                {
                  template_id: newTemplate.id,
                  category_id: categoryId,
                },
              ]);

            if (categoryError) throw categoryError;
          }
        }
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating micro SaaS:", error);
      alert("An error occurred while updating. Please check the console.");
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Edit Micro SaaS
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Service Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Select Service
            </label>
            <select
              value={selectedServiceId || ""}
              onChange={(e) => setSelectedServiceId(Number(e.target.value))}
              className={`w-full p-2 border rounded-lg ${
                errors.service && "border-red-500"
              }`}
            >
              <option value="" disabled>
                Select a service
              </option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            {errors.service && (
              <p className="text-red-600 text-sm">{errors.service}</p>
            )}
          </div>

          {/* Title Input */}
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

          {/* Slug Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Slug</label>
            <input
              type="text"
              placeholder="Enter slug (e.g., example-slug)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={`w-full p-2 border rounded-lg ${
                errors.slug && "border-red-500"
              }`}
            />
            {errors.slug && (
              <p className="text-red-600 text-sm">{errors.slug}</p>
            )}
          </div>

          {/* Description Editor */}
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

          {/* Templates Section */}
          {templates.map((template, index) => (
            <div key={index} className="space-y-2 border-t pt-4">
              <div className="flex justify-between items-center">
                <label className="block text-gray-700 font-medium mb-1">
                  Template {index + 1}
                </label>
                <button
                  onClick={() =>
                    setTemplates(templates.filter((_, i) => i !== index))
                  }
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash size={20} />
                </button>
              </div>

              {/* Template Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter template name"
                  value={template.name}
                  onChange={(e) =>
                    handleTemplateChange(index, "name", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {/* Template Categories */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Categories
                </label>
                <select
                  multiple
                  value={template.category_ids.map(String)}
                  onChange={(e) =>
                    handleTemplateChange(
                      index,
                      "category_ids",
                      Array.from(e.target.selectedOptions, (option) =>
                        Number(option.value)
                      )
                    )
                  }
                  className="w-full p-2 border rounded-lg"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Image Upload */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    handleImageUpload(index, e.target.files[0])
                  }
                  className="w-full p-2 border rounded-lg"
                />
                {template.thumbnail && (
                  <div className="mt-2">
                    <img
                      src={template.thumbnail}
                      alt="Template thumbnail"
                      className="h-20 w-20 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Template Price */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Price
                </label>
                <input
                  type="number"
                  placeholder="Enter price"
                  value={template.price}
                  onChange={(e) =>
                    handleTemplateChange(index, "price", Number(e.target.value))
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {/* Template Preview Link */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Preview Link
                </label>
                <input
                  type="text"
                  placeholder="Enter preview link"
                  value={template.preview_link}
                  onChange={(e) =>
                    handleTemplateChange(index, "preview_link", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          ))}

          {/* Add Template Button */}
          <CustomButton
            onClick={handleAddTemplate}
            variant="secondary"
            className="w-full"
          >
            Add Template
          </CustomButton>

          {/* Update Button */}
          <CustomButton
            onClick={handleUpdate}
            variant="primary"
            className="w-full mt-4"
          >
            Update Micro SaaS
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
