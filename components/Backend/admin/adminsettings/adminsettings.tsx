"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, EyeOff, Edit, X } from "lucide-react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { Icon } from "@/components/UI/icons";

type Credential = {
  id: number;
  created_at: string;
  email: string;
  password: string;
};

export default function AdminSettings() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCredential, setCurrentCredential] = useState<Credential | null>(
    null
  );
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const supabase = createClient();

  const fetchCredentials = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("credential")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch credentials"
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleView = (credential: Credential) => {
    setCurrentCredential(credential);
    setIsViewModalOpen(true);
  };

  const handleEdit = (credential: Credential) => {
    setCurrentCredential(credential);
    setEditEmail(credential.email);
    setEditPassword(credential.password);
    setShowPassword(false);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!currentCredential) return;

    try {
      const { error } = await supabase
        .from("credential")
        .update({ email: editEmail, password: editPassword })
        .eq("id", currentCredential.id);

      if (error) throw error;

      setIsEditModalOpen(false);
      fetchCredentials();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Settings</h1>

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
                  Email
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left">
                  Password
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left">
                  Created At
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {credentials.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-sm text-gray-500 text-center"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                credentials.map((credential) => (
                  <tr
                    key={credential.id}
                    className="hover:bg-gray-200 border border-gray-500"
                  >
                    <td className="px-6 py-4 text-sm text-gray-800 text-left">
                      {credential.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-left">
                      {credential.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-left">
                      ••••••••
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-left">
                      {new Date(credential.created_at).toLocaleDateString()}
                      {" , "}
                      {new Date(credential.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-right">
                      <div className="flex justify-end gap-2">
                        <CustomButton
                          onClick={() => handleView(credential)}
                          variant="primary"
                        >
                          <Icon icon={Eye} size={16} />
                        </CustomButton>
                        <CustomButton
                          onClick={() => handleEdit(credential)}
                          variant="secondary"
                        >
                          <Icon icon={Edit} size={16} />
                        </CustomButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isViewModalOpen && currentCredential && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">View Credential</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                aria-label="Close modal"
              >
                <Icon icon={X} size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <p>
                <strong>ID:</strong> {currentCredential.id}
              </p>
              <p>
                <strong>Email:</strong> {currentCredential.email}
              </p>
              <p>
                <strong>Password:</strong> {currentCredential.password}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(currentCredential.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && currentCredential && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Credential</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Close modal"
              >
                <Icon icon={X} size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative ">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md pr-10"
                  />
                  <button
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-2   flex items-center"
                  >
                    <Icon icon={showPassword ? EyeOff : Eye} size={20} />
                  </button>
                </div>
              </div>
              <CustomButton
                onClick={handleUpdate}
                variant="secondary"
                className="w-full"
              >
                Update Credential
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
