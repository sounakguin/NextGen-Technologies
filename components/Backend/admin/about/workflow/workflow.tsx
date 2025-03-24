"use client";

import React, { useCallback, useEffect, useState } from "react";
import createClient from "@/utils/supabase/client";
import { Pagination } from "@/components/UI/Pagination";
import AddWorkflow from "./addworkflow";
import EditWorkflow from "./editworkflow";
import ViewWorkflow from "./viewworkflow";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { Icon } from "@/components/UI/icons";
import { Eye, Edit, Trash } from "lucide-react";
import Image from "next/image";

type Workflow = {
  id: number;
  title: string;
  description: string;
  image: string;
  created_at: string;
};

const ITEMS_PER_PAGE = 10;

export default function Workflow() {
  const [Workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const supabase = createClient();

  const fetchWorkflows = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("aboutworkflow")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch Workflows"
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this Workflow?")) return;

    try {
      const { error } = await supabase
        .from("aboutworkflow")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchWorkflows();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete Workflow"
      );
    }
  };

  const totalPages = Math.ceil(Workflows.length / ITEMS_PER_PAGE);
  const paginatedWorkflows = Workflows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Workflows
        </h1>
        <CustomButton onClick={() => setIsAddModalOpen(true)} variant="primary">
          Add New Workflow
        </CustomButton>
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
                <th className="px-6 py-4 text-sm font-semibold text-left">
                  Image
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
              {paginatedWorkflows.map((Workflow) => (
                <tr
                  key={Workflow.id}
                  className="hover:bg-gray-200 border border-gray-500"
                >
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {Workflow.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 max-w-[200px] truncate">
                    {Workflow.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 max-w-[300px] truncate">
                    {Workflow.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    <Image
                      src={Workflow.image || "/placeholder.jpg"}
                      alt="Workflow image"
                      width={100}
                      height={100}
                      className="h-20 w-20 object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-right">
                    {new Date(Workflow.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-center">
                    <div className="flex justify-end gap-2">
                      <CustomButton
                        onClick={() => {
                          setCurrentWorkflow(Workflow);
                          setIsViewModalOpen(true);
                        }}
                        variant="primary"
                      >
                        <Icon icon={Eye} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => {
                          setCurrentWorkflow(Workflow);
                          setIsEditModalOpen(true);
                        }}
                        variant="secondary"
                      >
                        <Icon icon={Edit} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => handleDelete(Workflow.id)}
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

      <AddWorkflow
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onWorkflowAdded={fetchWorkflows}
      />

      {currentWorkflow && (
        <EditWorkflow
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          Workflow={currentWorkflow}
          onWorkflowUpdated={fetchWorkflows}
        />
      )}

      {currentWorkflow && (
        <ViewWorkflow
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          Workflow={currentWorkflow}
        />
      )}
    </div>
  );
}
