"use client";

import React, { useCallback, useEffect, useState } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { Icon } from "@/components/UI/icons";
import { Pagination } from "@/components/UI/Pagination";
import { Edit, Eye, Trash } from "lucide-react";
import AddWebTemplate from "./AddWebTemplate";
import WebTemplateCategory from "./WebTemplateCategory";

interface WebTemplate {
  id: number;
  service_id: number;
  title: string;
  description: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 10;

export default function WebTemplate() {
  const [webTemplates, setWebTemplates] = useState<WebTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const supabase = createClient();

  const fetchWebTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("web_template")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebTemplates(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch web templates"
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchWebTemplates();
  }, [fetchWebTemplates]);

  const handleDeleteWebTemplate = async (id: number) => {
    if (!confirm("Are you sure you want to delete this web template?")) return;

    try {
      const { error } = await supabase
        .from("web_template")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchWebTemplates();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete web template"
      );
    }
  };

  const totalPages = Math.ceil(webTemplates.length / ITEMS_PER_PAGE);
  const paginatedWebTemplates = webTemplates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Web Templates
        </h1>
        <div className="flex gap-2">
          <CustomButton
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
          >
            Add New Web Template
          </CustomButton>
          <CustomButton
            onClick={() => setIsCategoryModalOpen(true)}
            variant="secondary"
          >
            Manage Categories
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
              {paginatedWebTemplates.map((template) => (
                <tr
                  key={template.id}
                  className="hover:bg-gray-200 border border-gray-500"
                >
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {template.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 max-w-[200px] truncate">
                    {template.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {template.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-right">
                    {new Date(template.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-center">
                    <div className="flex justify-end gap-2">
                      <CustomButton
                        onClick={() => handleDeleteWebTemplate(template.id)}
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
        <AddWebTemplate
          onClose={() => setIsAddModalOpen(false)}
          onAdd={fetchWebTemplates}
        />
      )}

      {isCategoryModalOpen && (
        <WebTemplateCategory onClose={() => setIsCategoryModalOpen(false)} />
      )}
    </div>
  );
}
