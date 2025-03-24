"use client";
import { useEffect, useState } from "react";
import createClient from "@/utils/supabase/client";
import { X } from "lucide-react";

interface Template {
  id?: number;
  name: string;
  category_ids: number[];
  categories?: Array<{
    id: number;
    name: string;
  }>;
  thumbnail?: string;
  price: number;
  pages: number;
  views: number;
  preview_link: string;
  image_path: string;
}

interface ViewLandingPageProps {
  landingPage: {
    id: number;
    title: string;
    description: string;
    slug: string;
    service_id: number;
    templates: Template[];
  };
  onClose: () => void;
}

interface Service {
  id: number;
  name: string;
}

export default function ViewLandingPage({
  landingPage,
  onClose,
}: ViewLandingPageProps) {
  const [service, setService] = useState<Service | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchService = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name")
        .eq("id", landingPage.service_id)
        .single();

      if (error) {
        console.error("Error fetching service:", error);
      } else {
        setService(data);
      }
    };

    fetchService();
  }, [supabase, landingPage.service_id]);

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            View Landing Page
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
            <p className="text-gray-800">{landingPage.title}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Slug</label>
            <p className="text-gray-800">{landingPage.slug}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <div
              className="text-gray-800"
              dangerouslySetInnerHTML={{ __html: landingPage.description }}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Service
            </label>
            <p className="text-gray-800">{service?.name}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Templates
            </label>
            {landingPage.templates.map((template, index) => (
              <div key={index} className="p-4 border rounded-lg mb-4">
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
                    {template.categories?.map((cat) => cat.name).join(", ") ||
                      "No categories"}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Thumbnail Image
                  </label>
                  {template.thumbnail ? (
                    <img
                      src={template.thumbnail}
                      alt="Thumbnail"
                      className="w-32 h-32 object-cover rounded"
                    />
                  ) : (
                    <p className="text-gray-500">No thumbnail available</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Price
                  </label>
                  <p className="text-gray-800">${template.price}</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Pages
                  </label>
                  <p className="text-gray-800">{template.pages}</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Views
                  </label>
                  <p className="text-gray-800">{template.views}</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Preview Link
                  </label>
                  <a
                    href={template.preview_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
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
