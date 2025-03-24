"use client";

import { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X, Trash } from "lucide-react";
import RichTextEditor from "@/components/UI/Texteditor";

interface AddLandingPageProps {
  onClose: () => void;
  onAdd: () => void;
}

interface Service {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface LandingPageTemplate {
  id?: number;
  name: string;
  category_ids: number[];
  thumbnail?: string;
  price: number;
  pages: number;
  views: number;
  preview_link: string;
  image_path: string;
}

export default function AddLandingPage({
  onClose,
  onAdd,
}: AddLandingPageProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [templates, setTemplates] = useState<LandingPageTemplate[]>([]);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    service: "",
    slug: "",
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name");

      if (error) {
        console.error("Error fetching services:", error);
      } else {
        setServices(data);
      }
    };

    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("landingpage_categories")
        .select("id, name");

      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data);
      }
    };

    fetchServices();
    fetchCategories();
  }, [supabase]);

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
      if (!template.pages) {
        alert(`Template ${i + 1}: Number of pages is required.`);
        return false;
      }
      if (!template.views) {
        alert(`Template ${i + 1}: Number of views is required.`);
        return false;
      }
      if (!template.preview_link) {
        alert(`Template ${i + 1}: Preview link is required.`);
        return false;
      }
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateInputs()) return;
    if (!validateTemplates()) return;

    try {
      // Insert landing page data
      const { data: landingPageData, error: landingPageError } = await supabase
        .from("landing_pages")
        .insert([{ title, description, service_id: selectedServiceId, slug }])
        .select();

      if (landingPageError) throw landingPageError;

      const landingPageId = landingPageData[0].id;

      // Insert templates sequentially
      for (const template of templates) {
        console.log("Inserting template:", template);

        // Validate template data
        if (
          !template.name ||
          !template.category_ids.length ||
          !template.price ||
          !template.pages ||
          !template.views ||
          !template.preview_link
        ) {
          console.error("Template validation failed:", {
            name: !template.name,
            categories: !template.category_ids.length,
            price: !template.price,
            pages: !template.pages,
            views: !template.views,
            preview_link: !template.preview_link,
          });
          throw new Error("Template data is incomplete.");
        }

        // If image_path exists but thumbnail doesn't, get the public URL
        if (template.image_path && !template.thumbnail) {
          const { data: publicUrlData } = supabase.storage
            .from("Images")
            .getPublicUrl(template.image_path);
          template.thumbnail = publicUrlData.publicUrl;
        }

        // Ensure thumbnail has a default value if it's still empty
        if (!template.thumbnail) {
          template.thumbnail = "/placeholder.svg?height=300&width=400";
        }

        // Insert template
        const { data: templateData, error: templateError } = await supabase
          .from("landingpage_templates")
          .insert([
            {
              landing_page_id: landingPageId,
              name: template.name,
              thumbnail: template.thumbnail,
              price: template.price,
              pages: template.pages,
              views: template.views,
              preview_link: template.preview_link,
            },
          ])
          .select();

        if (templateError) {
          console.error("Template insertion error:", templateError);
          throw templateError;
        }

        console.log("Template inserted successfully:", templateData);

        // Insert template categories
        for (const categoryId of template.category_ids) {
          const { error: categoryError } = await supabase
            .from("template_categories")
            .insert([
              {
                template_id: templateData[0].id,
                category_id: categoryId,
              },
            ]);

          if (categoryError) {
            console.error("Category insertion error:", categoryError);
            throw categoryError;
          }
        }
      }

      onAdd();
      onClose();
    } catch (err) {
      console.error("Error creating landing page:", err);
    }
  };

  const handleAddTemplate = () => {
    setTemplates([
      ...templates,
      {
        name: "",
        category_ids: [],
        thumbnail: "",
        price: 0,
        pages: 0,
        views: 0,
        preview_link: "",
        image_path: "",
      },
    ]);
  };

  const handleTemplateChange = (
    index: number,
    field: keyof LandingPageTemplate,
    value: string | number | number[]
  ) => {
    const updatedTemplates = [...templates];
    updatedTemplates[index] = {
      ...updatedTemplates[index],
      [field]: value,
    };
    setTemplates(updatedTemplates);
  };

  const handleImageUpload = async (index: number, file: File) => {
    const filePath = `Navbar/Services/LandingPages/${file.name}`; // Updated path
    const { data, error } = await supabase.storage
      .from("Images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Error uploading image:", error);
    } else {
      const { data: publicUrlData } = supabase.storage
        .from("Images")
        .getPublicUrl(filePath);

      const updatedTemplates = [...templates];
      updatedTemplates[index].image_path = filePath;
      updatedTemplates[index].thumbnail = publicUrlData.publicUrl;
      setTemplates(updatedTemplates);
    }
  };
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px] h-[600px] overflow-y-scroll">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Add Landing Page
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
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

          {templates.map((template, index) => (
            <div key={index} className="space-y-2">
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

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload(index, e.target.files[0]);
                    }
                  }}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

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

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Pages
                </label>
                <input
                  type="number"
                  placeholder="Enter number of pages"
                  value={template.pages}
                  onChange={(e) =>
                    handleTemplateChange(index, "pages", Number(e.target.value))
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Views
                </label>
                <input
                  type="number"
                  placeholder="Enter number of views"
                  value={template.views}
                  onChange={(e) =>
                    handleTemplateChange(index, "views", Number(e.target.value))
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>

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

          <CustomButton
            onClick={handleAddTemplate}
            variant="secondary"
            className="w-full"
          >
            Add Template
          </CustomButton>

          <CustomButton
            onClick={handleCreate}
            variant="primary"
            className="w-full"
          >
            Create Landing Page
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
