"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/Backend/admin/dashboard/dashboard";

import BlogDetails from "@/components/Backend/admin/blogs/blogsdetails/blogsdetails";

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
      <BlogDetails />
    </Dashboard>
  );
};

export default BlogManagementPage;
