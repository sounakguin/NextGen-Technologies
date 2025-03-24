"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/Backend/admin/dashboard/dashboard";

import AboutText from "@/components/Backend/admin/about/abouttext/abouttext";

const BlogManagementPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if logged in
    const loggedIn = sessionStorage.getItem("loggedIn");

    // Redirect to login page if not logged in
    if (!loggedIn) {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <Dashboard>
      <AboutText />
    </Dashboard>
  );
};

export default BlogManagementPage;
