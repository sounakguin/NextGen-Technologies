"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/Backend/admin/dashboard/dashboard";

import PricingCards from "@/components/Backend/admin/pricing/pricingcards/pricing";
import Services from "@/components/Backend/admin/Navbar/Services/Services";
import DesignServices from "@/components/Backend/admin/Navbar/Services/DesignServices/DesignServices";

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
      <DesignServices />
    </Dashboard>
  );
};

export default BlogManagementPage;
