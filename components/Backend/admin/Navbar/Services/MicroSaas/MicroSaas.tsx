"use client";

import React, { useCallback, useEffect, useState } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { Icon } from "@/components/UI/icons";
import { Pagination } from "@/components/UI/Pagination";
import { Edit, Eye, Trash } from "lucide-react";
import AddMicroSaas from "./AddMicroSaas";
import EditMicroSaas from "./EditMicroSaas";
import ViewMicroSaas from "./ViewMicroSaas";
import MicroSaasCategory from "./MicroSaasCategory";

interface MicroSaas {
  id: number;
  service_id: number;
  title: string;
  description: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 10;

export default function MicroSaas() {
  const [microSaas, setMicroSaas] = useState<MicroSaas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedMicroSaasId, setSelectedMicroSaasId] = useState<number | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  const supabase = createClient();

  const fetchMicroSaas = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("micro_saas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMicroSaas(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch micro SaaS"
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchMicroSaas();
  }, [fetchMicroSaas]);

  const handleDeleteMicroSaas = async (id: number) => {
    if (!confirm("Are you sure you want to delete this micro SaaS?")) return;

    try {
      const { error } = await supabase.from("micro_saas").delete().eq("id", id);

      if (error) throw error;
      fetchMicroSaas();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete micro SaaS"
      );
    }
  };

  const totalPages = Math.ceil(microSaas.length / ITEMS_PER_PAGE);
  const paginatedMicroSaas = microSaas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Micro SaaS
        </h1>
        <div className="flex gap-2">
          <CustomButton
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
          >
            Add New Micro SaaS
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
              {paginatedMicroSaas.map((saas) => (
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
                          setSelectedMicroSaasId(saas.id);
                          setIsViewModalOpen(true);
                        }}
                        variant="primary"
                      >
                        <Icon icon={Eye} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => {
                          setSelectedMicroSaasId(saas.id);
                          setIsEditModalOpen(true);
                        }}
                        variant="secondary"
                      >
                        <Icon icon={Edit} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => handleDeleteMicroSaas(saas.id)}
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
        <AddMicroSaas
          onClose={() => setIsAddModalOpen(false)}
          onAdd={fetchMicroSaas}
        />
      )}

      {isEditModalOpen && selectedMicroSaasId && (
        <EditMicroSaas
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedMicroSaasId(null);
          }}
          onUpdate={fetchMicroSaas}
          microSaasId={selectedMicroSaasId}
        />
      )}

      {isViewModalOpen && selectedMicroSaasId && (
        <ViewMicroSaas
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedMicroSaasId(null);
          }}
          microSaasId={selectedMicroSaasId}
        />
      )}

      {isCategoryModalOpen && (
        <MicroSaasCategory onClose={() => setIsCategoryModalOpen(false)} />
      )}
    </div>
  );
}
