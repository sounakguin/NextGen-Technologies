"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Eye, Edit, X } from "lucide-react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { Icon } from "@/components/UI/icons";

type ProfileSettingsItem = {
  id: number;
  created_at: string;
  realname: string;
  panelname: string;
  profileimage: string;
};

export default function ProfileSettings() {
  const [data, setData] = useState<ProfileSettingsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentViewItem, setCurrentViewItem] =
    useState<ProfileSettingsItem | null>(null);
  const [currentEditItem, setCurrentEditItem] =
    useState<ProfileSettingsItem | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [realName, setRealName] = useState("");
  const [panelName, setPanelName] = useState("");

  const supabase = createClient();

  const fetchProfileSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error: supabaseError } = await supabase
        .from("profilesettings")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) throw supabaseError;
      setData(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch profile settings"
      );
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProfileSettings();
  }, [fetchProfileSettings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleView = (item: ProfileSettingsItem) => {
    setCurrentViewItem(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item: ProfileSettingsItem) => {
    setCurrentEditItem(item);
    setRealName(item.realname);
    setPanelName(item.panelname);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!currentEditItem) return;

    try {
      let profileImageUrl = currentEditItem.profileimage;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `ProfileSettings/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("Categories")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("Categories")
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) throw new Error("Failed to get public URL");

        profileImageUrl = urlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("profilesettings")
        .update({
          realname: realName,
          panelname: panelName,
          profileimage: profileImageUrl,
        })
        .eq("id", currentEditItem.id);

      if (updateError) throw updateError;

      setFile(null);
      setRealName("");
      setPanelName("");
      setIsEditModalOpen(false);
      fetchProfileSettings();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Profile Settings
      </h1>

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
                  Real Name
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left">
                  Panel Name
                </th>
                <th className="px-6 py-4 text-sm font-semibold text-left">
                  Profile Image
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
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-sm text-gray-500 text-center"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-200 border border-gray-500"
                  >
                    <td className="px-6 py-4 text-sm text-gray-800 text-left">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-left">
                      {item.realname}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-left">
                      {item.panelname}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-left">
                      <Image
                        src={item.profileimage || "/placeholder.svg"}
                        alt="Profile Image"
                        width={100}
                        height={100}
                        className="object-contain"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-left">
                      {new Date(item.created_at).toLocaleDateString()}
                      {" , "}
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 text-right">
                      <div className="flex justify-end gap-2">
                        <CustomButton
                          onClick={() => handleView(item)}
                          variant="primary"
                        >
                          <Icon icon={Eye} size={16} />
                        </CustomButton>
                        <CustomButton
                          onClick={() => handleEdit(item)}
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

      {isViewModalOpen && currentViewItem && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">View Profile</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                aria-label="Close modal"
              >
                <Icon icon={X} size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <Image
                src={currentViewItem.profileimage || "/placeholder.svg"}
                alt="Profile Image"
                width={500}
                height={500}
                className="object-contain mx-auto w-full"
              />
              <p>
                <strong>Real Name:</strong> {currentViewItem.realname}
              </p>
              <p>
                <strong>Panel Name:</strong> {currentViewItem.panelname}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(currentViewItem.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && currentEditItem && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Profile</h2>
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
                  Real Name
                </label>
                <input
                  type="text"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Panel Name
                </label>
                <input
                  type="text"
                  value={panelName}
                  onChange={(e) => setPanelName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>
              <CustomButton
                onClick={handleUpdate}
                variant="primary"
                className="w-full"
              >
                Update Profile
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
