import React, { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { X } from "lucide-react";
import Image from "next/image";

interface ViewWebTemplateProps {
  onClose: () => void;
  templateId: number;
}

interface WebTemplate {
  id: number;
  title: string;
  description: string;
  slug: string;
  service_id: number;
  created_at: string;
  updated_at: string;
}

interface WebTemplateDetail {
  id: number;
  name: string;
  category_ids: number[];
  thumbnail: string;
  price: number;
  pages: number;
  views: number;
  preview_link: string;
  image_path?: string;
}

export default function ViewWebTemplate({
  onClose,
  templateId,
}: ViewWebTemplateProps) {
  const [template, setTemplate] = useState<WebTemplate | null>(null);
  const [templateDetails, setTemplateDetails] = useState<WebTemplateDetail[]>(
    []
  );
  const [categories, setCategories] = useState<{ [key: number]: string }>({});

  const supabase = createClient();

  useEffect(() => {
    const fetchTemplateData = async () => {
      const { data: templateData, error: templateError } = await supabase
        .from("web_template")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError) {
        console.error("Error fetching template data:", templateError);
        return;
      }

      setTemplate(templateData);

      const { data: templateDetails, error: detailsError } = await supabase
        .from("web_templates")
        .select("*")
        .eq("web_template_id", templateId);

      if (detailsError) {
        console.error("Error fetching template details:", detailsError);
        return;
      }

      setTemplateDetails(templateDetails);

      const { data: categoryData, error: categoryError } = await supabase
        .from("webtemplate_categories")
        .select("id, name");

      if (categoryError) {
        console.error("Error fetching categories:", categoryError);
        return;
      }

      const categoryMap = categoryData.reduce((acc, category) => {
        acc[category.id] = category.name;
        return acc;
      }, {} as { [key: number]: string });

      setCategories(categoryMap);
    };

    fetchTemplateData();
  }, [templateId, supabase]);

  if (!template) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            View Web Template
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
            <h3 className="text-lg font-medium text-gray-700">Template Info</h3>
            <p className="text-sm text-gray-600">
              <strong>Title:</strong> {template.title}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Slug:</strong> {template.slug}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Description:</strong> {template.description}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700">Details</h3>
            {templateDetails.map((detail) => (
              <div
                key={detail.id}
                className="border rounded-lg p-4 mb-4 space-y-2"
              >
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {detail.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Price:</strong> ${detail.price}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Pages:</strong> {detail.pages}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Views:</strong> {detail.views}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Preview Link:</strong>{" "}
                  <a
                    href={detail.preview_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View Preview
                  </a>
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Categories:</strong>{" "}
                  {detail.category_ids
                    .map((id) => categories[id])
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {detail.thumbnail && (
                  <Image
                    src={detail.thumbnail}
                    alt="Thumbnail"
                    width={800}
                    height={450}
                    className="w-full h-auto rounded-lg"
                    priority
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
