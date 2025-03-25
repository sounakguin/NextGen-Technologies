import React, { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X, Trash } from "lucide-react";
import RichTextEditor from "@/components/UI/Texteditor";

interface EditWebTemplateProps {
  onClose: () => void;
  onEdit: () => void;
  templateId: number;
}

interface Service {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface WebTemplateDetail {
  id?: number;
  name: string;
  category_ids: number[];
  thumbnail: string;
  price: number;
  pages: number;
  views: number;
  preview_link: string;
  image_path?: string;
}

export default function EditWebTemplate({
  onClose,
  onEdit,
  templateId,
}: EditWebTemplateProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [templates, setTemplates] = useState<WebTemplateDetail[]>([]);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    service: "",
    slug: "",
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch template data
      const { data: templateData, error: templateError } = await supabase
        .from("web_template")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError) {
        console.error("Error fetching template data:", templateError);
        return;
      }

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*");

      if (servicesError) {
        console.error("Error fetching services:", servicesError);
        return;
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("webtemplate_categories")
        .select("*");

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
        return;
      }

      setTitle(templateData.title);
      setDescription(templateData.description);
      setSlug(templateData.slug);
      setSelectedServiceId(templateData.service_id);
      setServices(servicesData);
      setCategories(categoriesData);

      const { data: templateDetails, error: detailsError } = await supabase
        .from("web_templates")
        .select("*")
        .eq("web_template_id", templateId);

      if (detailsError) {
        console.error("Error fetching template details:", detailsError);
        return;
      }

      const templatesWithCategories = await Promise.all(
        templateDetails.map(async (detail) => {
          const { data: categoryData, error: categoryError } = await supabase
            .from("webtemplate_category_relations")
            .select("category_id")
            .eq("template_id", detail.id);

          if (categoryError) {
            console.error("Error fetching categories:", categoryError);
            return;
          }

          return {
            ...detail,
            category_ids: categoryData.map((cat) => cat.category_id),
          };
        })
      );

      setTemplates(templatesWithCategories);
    };

    fetchData();
  }, [templateId, supabase]);

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

  const handleUpdate = async () => {
    if (!validateInputs() || !validateTemplates()) return;

    try {
      // Update web template
      const { error: webTemplateError } = await supabase
        .from("web_template")
        .update({ title, description, service_id: selectedServiceId, slug })
        .eq("id", templateId);

      if (webTemplateError) throw webTemplateError;

      // Update templates
      for (const template of templates) {
        // Update template details
        const { error: templateError } = await supabase
          .from("web_templates")
          .update({
            name: template.name,
            thumbnail: template.thumbnail || "/placeholder.svg",
            price: template.price,
            pages: template.pages,
            views: template.views,
            preview_link: template.preview_link,
          })
          .eq("id", template.id);

        if (templateError) throw templateError;

        // Update template categories
        const { error: deleteCategoryError } = await supabase
          .from("webtemplate_category_relations")
          .delete()
          .eq("template_id", template.id);

        if (deleteCategoryError) throw deleteCategoryError;

        for (const categoryId of template.category_ids) {
          const { error: categoryError } = await supabase
            .from("webtemplate_category_relations")
            .insert([
              {
                template_id: template.id,
                category_id: categoryId,
              },
            ]);

          if (categoryError) throw categoryError;
        }
      }

      onEdit();
      onClose();
    } catch (err) {
      console.error("Error updating web template:", err);
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
      },
    ]);
  };

  const handleTemplateChange = (
    index: number,
    field: keyof WebTemplateDetail,
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
    const filePath = `WebTemplates/${file.name}`;
    const { error } = await supabase.storage
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
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Edit Web Template
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
                  accept="image/*"
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
            onClick={handleUpdate}
            variant="primary"
            className="w-full"
          >
            Update Web Template
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
