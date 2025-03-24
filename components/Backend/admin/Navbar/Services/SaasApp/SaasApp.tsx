"use client";

import React, { useCallback, useEffect, useState } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { Icon } from "@/components/UI/icons";
import { Pagination } from "@/components/UI/Pagination";
import { Edit, Eye, Trash } from "lucide-react";
import AddSaaSApp from "./AddSaasApp";
import EditSaaSApp from "./EditSaasApp";
import ViewSaaSApp from "./ViewSaasApp";
import SaaSAppCategory from "./SaasAppCategory";

interface SaaSApp {
  id: number;
  service_id: number;
  title: string;
  description: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 10;

export default function SaaSApp() {
  const [saasApps, setSaaSApps] = useState<SaaSApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSaaSAppId, setSelectedSaaSAppId] = useState<number | null>(
    null
  );

  const supabase = createClient();

  const fetchSaaSApps = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("saas_app")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSaaSApps(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch SaaS Apps"
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSaaSApps();
  }, [fetchSaaSApps]);

  const handleDeleteSaaSApp = async (id: number) => {
    if (!confirm("Are you sure you want to delete this SaaS App?")) return;

    try {
      const { error } = await supabase.from("saas_app").delete().eq("id", id);

      if (error) throw error;
      fetchSaaSApps();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete SaaS App"
      );
    }
  };

  const totalPages = Math.ceil(saasApps.length / ITEMS_PER_PAGE);
  const paginatedSaaSApps = saasApps.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          SaaS Apps
        </h1>
        <div className="flex gap-2">
          <CustomButton
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
          >
            Add New SaaS App
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
              {paginatedSaaSApps.map((saas) => (
                <tr
                  key={saas.id}
                  className="hover:bg-gray-200 border border-gray-500"
                >
                  <td className="px-6 py-4 text-sm text-gray-800">{saas.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 max-w-[200px] truncate">
                    {saas.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {saas.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-right">
                    {new Date(saas.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-center">
                    <div className="flex justify-end gap-2">
                      <CustomButton
                        onClick={() => {
                          setSelectedSaaSAppId(saas.id);
                          setIsViewModalOpen(true);
                        }}
                        variant="primary"
                      >
                        <Icon icon={Eye} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => {
                          setSelectedSaaSAppId(saas.id);
                          setIsEditModalOpen(true);
                        }}
                        variant="primary"
                      >
                        <Icon icon={Edit} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => handleDeleteSaaSApp(saas.id)}
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
        <AddSaaSApp
          onClose={() => setIsAddModalOpen(false)}
          onAdd={fetchSaaSApps}
        />
      )}

      {isEditModalOpen && selectedSaaSAppId && (
        <EditSaaSApp
          saasAppId={selectedSaaSAppId}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={fetchSaaSApps}
        />
      )}

      {isViewModalOpen && selectedSaaSAppId && (
        <ViewSaaSApp
          saasAppId={selectedSaaSAppId}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {isCategoryModalOpen && (
        <SaaSAppCategory onClose={() => setIsCategoryModalOpen(false)} />
      )}
    </div>
  );
}
