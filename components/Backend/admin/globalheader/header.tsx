"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import createClient from "@/utils/supabase/client";
import Link from "next/link";

interface ProfileSettings {
  realname: string;
  panelname: string;
  profileimage: string;
}

export default function Header() {
  const [profileSettings, setProfileSettings] =
    useState<ProfileSettings | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [closeTimer, setCloseTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchProfileSettings();
  }, []);

  async function fetchProfileSettings() {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("profilesettings")
        .select("realname, panelname, profileimage")
        .single();

      if (error) {
        console.error("Error fetching profile settings:", error);
        return;
      }

      setProfileSettings(data);
    } catch (error) {
      console.error("Error fetching profile settings:", error);
    }
  }

  const handleDropdownMouseEnter = () => {
    if (closeTimer) clearTimeout(closeTimer);
    setDropdownVisible(true);
  };

  const handleDropdownMouseLeave = () => {
    // Set a timer to hide the dropdown after 2 seconds
    const timer = setTimeout(() => {
      setDropdownVisible(false);
    }, 1000);

    setCloseTimer(timer); // Save the timer to clear it if needed
  };

  return (
    <header className="flex h-20 items-center justify-end border-b px-6 shadow-xl bg-white">
      {/* Profile Section */}
      <div
        className="relative flex items-center gap-3 pl-4 border-l"
        onMouseEnter={handleDropdownMouseEnter}
        onMouseLeave={handleDropdownMouseLeave}
      >
        {/* User Details */}
        <div className="text-right">
          <div className="text-sm font-medium">
            {profileSettings?.realname || "Loading..."}
          </div>
          <div className="text-xs text-gray-500">
            {profileSettings?.panelname || "Loading..."}
          </div>
        </div>

        {/* User Avatar */}
        <div className="h-9 w-9 rounded-full overflow-hidden">
          <Image
            src={profileSettings?.profileimage || "/others/phimage.webp"}
            alt="User avatar"
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Dropdown Menu */}
        {dropdownVisible && (
          <div className="absolute top-11 right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
            <div className="p-2">
              <Link
                href="/admin/profilesettings"
                className="block text-sm text-gray-700 py-1 px-4 hover:bg-gray-100"
              >
                Profile Settings
              </Link>
              <Link
                href="/admin/adminsettings"
                className="block text-sm text-gray-700 py-1 px-4 hover:bg-gray-100"
              >
                Account Settings
              </Link>
              <Link
                href="/admin/login"
                className="block text-sm text-gray-700 py-1 px-4 hover:bg-gray-100"
              >
                Logout
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
