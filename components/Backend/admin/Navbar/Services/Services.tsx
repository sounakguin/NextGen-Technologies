"use client";

import React, { useCallback, useEffect, useState } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { Icon } from "@/components/UI/icons";
import { Pagination } from "@/components/UI/Pagination";
import { Edit, Eye, Trash } from "lucide-react";
import AddService from "./AddServices";
import EditService from "./EditServices";
import ViewService from "./ViewServices";
import ServiceCategory from "./ServiceCategory"; // Import the new component

type Service = {
  id: number;
  name: string;
  category_id: number; // Added category_id
  created_at: string;
  updated_at: string;
  sub_services: SubService[];
};

type SubService = {
  id: number;
  service_id: number;
  image: string;
  title: string;
  description: string;
  slug: string; // Add this line
  created_at: string;
  updated_at: string;
};

const ITEMS_PER_PAGE = 10;

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const supabase = createClient();

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      if (servicesError) throw servicesError;

      const servicesWithSubServices = await Promise.all(
        servicesData.map(async (service) => {
          const { data: subServicesData, error: subServicesError } =
            await supabase
              .from("sub_services")
              .select("*")
              .eq("service_id", service.id);

          if (subServicesError) throw subServicesError;

          return {
            ...service,
            sub_services: subServicesData || [],
          };
        })
      );

      setServices(servicesWithSubServices);
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
      const { error } = await supabase.from("services").delete().eq("id", id);

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
          Services
        </h1>
        <div className="flex gap-2">
          <CustomButton
            onClick={() => setIsCategoryModalOpen(true)}
            variant="secondary"
          >
            Manage Categories
          </CustomButton>
          <CustomButton
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
          >
            Add New Service
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
                  Name
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left">
                  Sub-Services
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
                    {service.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {service.sub_services.length}
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

      {(isAddModalOpen ||
        isEditModalOpen ||
        isViewModalOpen ||
        isCategoryModalOpen) && <div className="modal-backdrop"></div>}

      {isAddModalOpen && (
        <AddService
          onClose={() => setIsAddModalOpen(false)}
          onAdd={fetchServices}
        />
      )}

      {isEditModalOpen && currentService && (
        <EditService
          service={currentService}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={fetchServices}
        />
      )}

      {isViewModalOpen && currentService && (
        <ViewService
          service={currentService}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {isCategoryModalOpen && (
        <ServiceCategory onClose={() => setIsCategoryModalOpen(false)} />
      )}
    </div>
  );
}
