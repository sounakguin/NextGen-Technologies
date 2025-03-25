"use client";

import React, { useCallback, useEffect, useState } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { Icon } from "@/components/UI/icons";
import { Pagination } from "@/components/UI/Pagination";
import { Edit, Eye, Trash } from "lucide-react";
import AddDesignService from "./AddDesignServices";
import EditDesignService from "./EditDesignServices";
import ViewDesignService from "./ViewDesignServices";

interface MonthlyPlan {
  id: number;
  title: string;
  description: string;
  features: string; // Changed from any[] to string
  design_services_id: number;
  created_at: string;
  updated_at: string;
}

interface DesignService {
  id: number;
  slug: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  monthly_plans: MonthlyPlan[];
}

const ITEMS_PER_PAGE = 10;

export default function DesignServices() {
  const [services, setServices] = useState<DesignService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<DesignService | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  const supabase = createClient();

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: servicesData, error: servicesError } = await supabase
        .from("design_services")
        .select("*")
        .order("created_at", { ascending: false });

      if (servicesError) throw servicesError;

      const servicesWithPlans = await Promise.all(
        servicesData.map(async (service) => {
          const { data: plansData, error: plansError } = await supabase
            .from("monthly_plans")
            .select("*")
            .eq("design_services_id", service.id);

          if (plansError) throw plansError;

          return {
            ...service,
            monthly_plans: plansData || [],
          };
        })
      );

      setServices(servicesWithPlans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch services");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleDeleteService = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const { error } = await supabase
        .from("design_services")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete service");
    }
  };

  const totalPages = Math.ceil(services.length / ITEMS_PER_PAGE);
  const paginatedServices = services.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Design Services
        </h1>
        <CustomButton onClick={() => setIsAddModalOpen(true)} variant="primary">
          Add New Design Service
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
                  Slug
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left">
                  Plans
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
              {paginatedServices.map((service) => (
                <tr
                  key={service.id}
                  className="hover:bg-gray-200 border border-gray-500"
                >
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {service.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 max-w-[200px] truncate">
                    {service.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {service.slug}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {service.monthly_plans.length}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-right">
                    {new Date(service.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-center">
                    <div className="flex justify-end gap-2">
                      <CustomButton
                        onClick={() => {
                          setCurrentService(service);
                          setIsViewModalOpen(true);
                        }}
                        variant="primary"
                      >
                        <Icon icon={Eye} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => {
                          setCurrentService(service);
                          setIsEditModalOpen(true);
                        }}
                        variant="secondary"
                      >
                        <Icon icon={Edit} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => handleDeleteService(service.id)}
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

      {(isAddModalOpen || isEditModalOpen || isViewModalOpen) && (
        <div className="modal-backdrop"></div>
      )}

      {isAddModalOpen && (
        <AddDesignService
          onClose={() => setIsAddModalOpen(false)}
          onAdd={fetchServices}
        />
      )}

      {isEditModalOpen && currentService && (
        <EditDesignService
          service={currentService}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={fetchServices}
        />
      )}

      {isViewModalOpen && currentService && (
        <ViewDesignService
          service={currentService}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
}
