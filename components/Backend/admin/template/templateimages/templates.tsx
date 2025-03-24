"use client";

import React, { useCallback, useEffect, useState } from "react";
import createClient from "@/utils/supabase/client";
import { Eye, Edit, Trash } from "lucide-react";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { Icon } from "@/components/UI/icons";
import { Pagination } from "@/components/UI/Pagination";
import Image from "next/image";
import Addtemplates from "./addtemplates";
import Edittemplates from "./edittemplates";
import Viewtemplates from "./viewtemplates";

type AboutAwardsImage = {
  id: number;
  image: string;
  created_at: string;
};

const ITEMS_PER_PAGE = 10;

export default function Templates() {
  const [items, setItems] = useState<AboutAwardsImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<AboutAwardsImage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const supabase = createClient();

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch items");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const { error } = await supabase.from("templates").delete().eq("id", id);

      if (error) throw error;
      fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          About Awards Images
        </h1>
        <CustomButton onClick={() => setIsAddModalOpen(true)} variant="primary">
          Add New Image
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
              {paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-200 border border-gray-500"
                >
                  <td className="px-6 py-4 text-sm text-gray-800">{item.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    <Image
                      src={item.image || "/placeholder.jpg"}
                      alt="Awards image"
                      width={100}
                      height={100}
                      className="h-20 w-20 object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-right">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-center">
                    <div className="flex justify-end gap-2">
                      <CustomButton
                        onClick={() => {
                          setCurrentItem(item);
                          setIsViewModalOpen(true);
                        }}
                        variant="primary"
                      >
                        <Icon icon={Eye} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => {
                          setCurrentItem(item);
                          setIsEditModalOpen(true);
                        }}
                        variant="secondary"
                      >
                        <Icon icon={Edit} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => handleDelete(item.id)}
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
        <Addtemplates
          onClose={() => setIsAddModalOpen(false)}
          fetchItems={fetchItems}
        />
      )}

      {isEditModalOpen && currentItem && (
        <Edittemplates
          item={currentItem}
          onClose={() => setIsEditModalOpen(false)}
          fetchItems={fetchItems}
        />
      )}

      {isViewModalOpen && currentItem && (
        <Viewtemplates
          item={currentItem}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
}
