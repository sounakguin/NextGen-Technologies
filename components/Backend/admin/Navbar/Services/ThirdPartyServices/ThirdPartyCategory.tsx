"use client";

import { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X, Trash, Edit } from "lucide-react";

interface ThirdPartyCategory {
  id: number;
  name: string;
}

export default function ThirdPartyCategory({
  onClose,
}: {
  onClose: () => void;
}) {
  const [categories, setCategories] = useState<ThirdPartyCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] =
    useState<ThirdPartyCategory | null>(null);
  const [name, setName] = useState("");

  const supabase = createClient();

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("thirdparty_categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateOrUpdateCategory = async () => {
    if (!name.trim()) {
      setError("Category name cannot be empty.");
      return;
    }

    try {
      if (isEditing && currentCategory) {
        const { error } = await supabase
          .from("thirdparty_categories")
          .update({ name })
          .eq("id", currentCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("thirdparty_categories")
          .insert([{ name }]);

        if (error) throw error;
      }

      setName("");
      setIsEditing(false);
      setCurrentCategory(null);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    }
  };

  const handleEditCategory = (category: ThirdPartyCategory) => {
    setCurrentCategory(category);
    setName(category.name);
    setIsEditing(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      // Check if category is in use
      const { data: usageData, error: usageError } = await supabase
        .from("thirdparty_service_category")
        .select("service_id")
        .eq("category_id", id);

      if (usageError) throw usageError;

      if (usageData && usageData.length > 0) {
        setError(
          "Cannot delete category because it is being used by one or more services."
        );
        return;
      }

      const { error } = await supabase
        .from("thirdparty_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category"
      );
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setName("");
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Manage Third-Party Categories
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Category Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 p-2 border rounded-lg"
              />
              <CustomButton
                onClick={handleCreateOrUpdateCategory}
                variant="primary"
              >
                {isEditing ? "Update" : "Add"}
              </CustomButton>
              {isEditing && (
                <CustomButton onClick={handleCancelEdit} variant="secondary">
                  Cancel
                </CustomButton>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-600 text-white">
                    <th className="px-6 py-4 text-sm font-semibold text-left">
                      ID
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-left">
                      Name
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-gray-200 border border-gray-500"
                    >
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {category.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        <div className="flex justify-center gap-2">
                          <CustomButton
                            onClick={() => handleEditCategory(category)}
                            variant="secondary"
                          >
                            <Edit size={16} />
                          </CustomButton>
                          <CustomButton
                            onClick={() => handleDeleteCategory(category.id)}
                            variant="danger"
                          >
                            <Trash size={16} />
                          </CustomButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
