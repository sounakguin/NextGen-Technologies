"use client";

import React, { useCallback, useEffect, useState } from "react";
import createClient from "@/utils/supabase/client";
import { Pagination } from "@/components/UI/Pagination";
import AddBanner from "./addbanner";
import EditBanner from "./editbanner";
import ViewBanner from "./viewbanner";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { Icon } from "@/components/UI/icons";
import { Eye, Edit, Trash } from "lucide-react";
import Image from "next/image";

type Banner = {
  id: number;
  title: string;
  description: string;
  image: string;
  created_at: string;
};

const ITEMS_PER_PAGE = 10;

export default function Banner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const supabase = createClient();

  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("banner")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBanners(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch banners");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const { error } = await supabase.from("banner").delete().eq("id", id);

      if (error) throw error;
      fetchBanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete banner");
    }
  };

  const totalPages = Math.ceil(banners.length / ITEMS_PER_PAGE);
  const paginatedBanners = banners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Banners
        </h1>
        <CustomButton onClick={() => setIsAddModalOpen(true)} variant="primary">
          Add New Banner
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
              {paginatedBanners.map((banner) => (
                <tr
                  key={banner.id}
                  className="hover:bg-gray-200 border border-gray-500"
                >
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {banner.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 max-w-[200px] truncate">
                    {banner.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 max-w-[300px] truncate">
                    {banner.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    <Image
                      src={banner.image || "/placeholder.jpg"}
                      alt="Banner image"
                      width={100}
                      height={100}
                      className="h-20 w-20 object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-right">
                    {new Date(banner.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-center">
                    <div className="flex justify-end gap-2">
                      <CustomButton
                        onClick={() => {
                          setCurrentBanner(banner);
                          setIsViewModalOpen(true);
                        }}
                        variant="primary"
                      >
                        <Icon icon={Eye} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => {
                          setCurrentBanner(banner);
                          setIsEditModalOpen(true);
                        }}
                        variant="secondary"
                      >
                        <Icon icon={Edit} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => handleDelete(banner.id)}
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

      <AddBanner
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBannerAdded={fetchBanners}
      />

      {currentBanner && (
        <EditBanner
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          banner={currentBanner}
          onBannerUpdated={fetchBanners}
        />
      )}

      {currentBanner && (
        <ViewBanner
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          banner={currentBanner}
        />
      )}
    </div>
  );
}
