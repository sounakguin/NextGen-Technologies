import React, { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { X } from "lucide-react";
import Image from "next/image";

interface ViewSaaSAppProps {
  saasAppId: number;
  onClose: () => void;
}

interface SaaSApp {
  id: number;
  title: string;
  description: string;
  slug: string;
  service_id: number;
  created_at: string;
  updated_at: string;
}

interface SaaSAppTemplateDetail {
  id: number;
  name: string;
  thumbnail: string;
  price: number;
  preview_link: string;
  categories: string[];
}

interface CategoryRelation {
  category_id: number;
}

export default function ViewSaaSApp({ saasAppId, onClose }: ViewSaaSAppProps) {
  const [saasApp, setSaaSApp] = useState<SaaSApp | null>(null);
  const [templates, setTemplates] = useState<SaaSAppTemplateDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchSaaSApp = async () => {
      const { data, error } = await supabase
        .from("saas_app")
        .select("*")
        .eq("id", saasAppId)
        .single();

      if (error) {
        console.error("Error fetching SaaS App:", error);
      } else {
        setSaaSApp(data);
      }
    };

    const fetchTemplates = async () => {
      const { data, error } = await supabase
        .from("saas_app_template")
        .select("*, saas_app_category_relations(category_id)")
        .eq("saas_app_id", saasAppId);

      if (error) {
        console.error("Error fetching templates:", error);
      } else {
        const templatesWithCategories = await Promise.all(
          data.map(async (template) => {
            const { data: categories } = await supabase
              .from("saas_app_categories")
              .select("name")
              .in(
                "id",
                template.saas_app_category_relations.map(
                  (rel: CategoryRelation) => rel.category_id
                )
              );

            return {
              ...template,
              categories: categories?.map((cat) => cat.name) || [],
            };
          })
        );

        setTemplates(templatesWithCategories);
      }
    };

    fetchSaaSApp();
    fetchTemplates();
    setIsLoading(false);
  }, [saasAppId, supabase]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!saasApp) {
    return <div>SaaS App not found.</div>;
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            View SaaS App
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
              Title
            </label>
            <p className="text-gray-800">{saasApp.title}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Slug</label>
            <p className="text-gray-800">{saasApp.slug}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <div
              className="text-gray-800"
              dangerouslySetInnerHTML={{ __html: saasApp.description }}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Templates
            </label>
            {templates.map((template, index) => (
              <div key={index} className="space-y-2 border-t pt-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Name
                  </label>
                  <p className="text-gray-800">{template.name}</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Categories
                  </label>
                  <p className="text-gray-800">
                    {template.categories.join(", ")}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Thumbnail Image
                  </label>
                  <Image
                    src={template.thumbnail}
                    alt={template.name}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Price
                  </label>
                  <p className="text-gray-800">${template.price}</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Preview Link
                  </label>
                  <a
                    href={template.preview_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {template.preview_link}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
