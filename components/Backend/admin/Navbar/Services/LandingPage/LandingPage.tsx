"use client";
import React, { useCallback, useEffect, useState } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { Icon } from "@/components/UI/icons";
import { Pagination } from "@/components/UI/Pagination";
import { Edit, Eye, Trash } from "lucide-react";
import AddLandingPage from "./AddLandingPage";
import EditLandingPage from "./EditLandingPage";
import ViewLandingPage from "./ViewLandingPage";
import LandingPageCategory from "./LandingPageCategory";

interface Template {
  id?: number;
  name: string;
  category_ids: number[];
  thumbnail?: string;
  price: number;
  pages: number;
  views: number;
  preview_link: string;
  image_path: string;
  categories?: TemplateCategoryRelation[];
}

interface LandingPage {
  id: number;
  service_id: number;
  title: string;
  description: string;
  slug: string;
  created_at: string;
  updated_at: string;
  templates: Template[];
}

interface LandingPageCategory {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
}

interface TemplateCategoryRelation {
  category: LandingPageCategory;
}

export default function LandingPageManager() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [currentLandingPage, setCurrentLandingPage] =
    useState<LandingPage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const supabase = createClient();

  const fetchLandingPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: landingPagesData, error: landingPagesError } =
        await supabase
          .from("landing_pages")
          .select(
            `
          *,
          templates:landingpage_templates(
            *,
            categories:template_categories(
              category:landingpage_categories(*)
            )
          )
        `
          )
          .order("created_at", { ascending: false });

      if (landingPagesError) throw landingPagesError;

      const formattedLandingPages = landingPagesData.map((page) => ({
        ...page,
        templates: (page.templates || []).map((template: Template) => ({
          ...template,
          category_ids:
            template.categories?.map((cat) => cat.category.id) || [],
          categories: template.categories || [],
        })),
      }));

      setLandingPages(formattedLandingPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch landing pages"
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchLandingPages();
  }, [fetchLandingPages]);

  const handleDeleteLandingPage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this landing page?")) return;

    try {
      const { error } = await supabase
        .from("landing_pages")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchLandingPages();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete landing page"
      );
    }
  };

  const ITEMS_PER_PAGE = 10; // Define the number of items per page
  const totalPages = Math.ceil(landingPages.length / ITEMS_PER_PAGE);
  const paginatedLandingPages = landingPages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Landing Pages
        </h1>
        <div className="flex gap-2">
          <CustomButton
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
          >
            Add New Landing Page
          </CustomButton>
          <CustomButton
            onClick={() => setIsCategoryModalOpen(true)}
            variant="secondary"
          >
            Add Category
          </CustomButton>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto mt-10">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-600 text-white">
                <th className="px-6 py-4 text-sm font-semibold text-left">
                  ID
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left">
                  Title
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left">
                  Description
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-right">
                  Created At
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLandingPages.map((landingPage) => (
                <tr
                  key={landingPage.id}
                  className="hover:bg-gray-200 border border-gray-500"
                >
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {landingPage.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 max-w-[200px] truncate">
                    {landingPage.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {landingPage.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-right">
                    {new Date(landingPage.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-center">
                    <div className="flex justify-end gap-2">
                      <CustomButton
                        onClick={() => {
                          setCurrentLandingPage(landingPage);
                          setIsViewModalOpen(true);
                        }}
                        variant="primary"
                      >
                        <Icon icon={Eye} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => {
                          setCurrentLandingPage(landingPage);
                          setIsEditModalOpen(true);
                        }}
                        variant="secondary"
                      >
                        <Icon icon={Edit} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => handleDeleteLandingPage(landingPage.id)}
                        variant="danger"
                      >
                        <Icon icon={Trash} size={16} />
                      </CustomButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {isAddModalOpen && (
        <AddLandingPage
          onClose={() => setIsAddModalOpen(false)}
          onAdd={fetchLandingPages}
        />
      )}

      {isEditModalOpen && currentLandingPage && (
        <EditLandingPage
          landingPage={currentLandingPage}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentLandingPage(null);
          }}
          onUpdate={fetchLandingPages}
        />
      )}

      {isViewModalOpen && currentLandingPage && (
        <ViewLandingPage
          landingPage={{
            ...currentLandingPage,
            templates: currentLandingPage.templates.map((template) => ({
              ...template,
              categories: template.categories?.map((cat) => ({
                id: cat.category.id,
                name: cat.category.name,
              })),
            })),
          }}
          onClose={() => {
            setIsViewModalOpen(false);
            setCurrentLandingPage(null);
          }}
        />
      )}

      {isCategoryModalOpen && (
        <LandingPageCategory onClose={() => setIsCategoryModalOpen(false)} />
      )}
    </div>
  );
}
