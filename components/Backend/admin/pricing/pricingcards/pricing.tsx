"use client";

import React, { useCallback, useEffect, useState } from "react";
import createClient from "@/utils/supabase/client";
import { Eye, Edit, Trash } from "lucide-react";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { Icon } from "@/components/UI/icons";
import { Pagination } from "@/components/UI/Pagination";
import AddPricing from "./addpricing";
import EditPricing from "./editpricing";
import ViewPricing from "./viewpricing";

type PricingPlan = {
  id: number;
  name: string;
  tag: string;
  description: string;
  price: number;
  billing_cycle: string;
  features: string[];
  created_at: string;
};

const ITEMS_PER_PAGE = 10;

export default function PricingCards() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PricingPlan | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const supabase = createClient();

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("pricing_plans")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch plans");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const { error } = await supabase
        .from("pricing_plans")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete plan");
    }
  };

  const totalPages = Math.ceil(plans.length / ITEMS_PER_PAGE);
  const paginatedPlans = plans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Pricing Plans
        </h1>
        <CustomButton onClick={() => setIsAddModalOpen(true)} variant="primary">
          Add New Plan
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
                  Name
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left">
                  Tag
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left">
                  Price
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left">
                  Billing Cycle
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlans.map((plan) => (
                <tr
                  key={plan.id}
                  className="hover:bg-gray-200 border border-gray-500"
                >
                  <td className="px-6 py-4 text-sm text-gray-800">{plan.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 max-w-[200px] truncate">
                    {plan.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {plan.tag}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    ${plan.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {plan.billing_cycle}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-center">
                    <div className="flex justify-end gap-2">
                      <CustomButton
                        onClick={() => {
                          setCurrentPlan(plan);
                          setIsViewModalOpen(true);
                        }}
                        variant="primary"
                      >
                        <Icon icon={Eye} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => {
                          setCurrentPlan(plan);
                          setIsEditModalOpen(true);
                        }}
                        variant="secondary"
                      >
                        <Icon icon={Edit} size={16} />
                      </CustomButton>
                      <CustomButton
                        onClick={() => handleDelete(plan.id)}
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
        <AddPricing
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchPlans}
        />
      )}

      {isEditModalOpen && currentPlan && (
        <EditPricing
          plan={currentPlan}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchPlans}
        />
      )}

      {isViewModalOpen && currentPlan && (
        <ViewPricing
          plan={currentPlan}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
}
