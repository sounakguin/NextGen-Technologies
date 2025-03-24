import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AboutWorkflowClient from "./AboutWorkflowClient";

export default async function AboutWorkflowServer() {
  try {
    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Fetch data from Supabase
    const { data, error } = await supabase.from("aboutworkflow").select("*");

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return (
        <div className="text-red-500 text-center py-10">
          Error loading workflow data
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-gray-500 text-center py-10">
          No workflow data found
        </div>
      );
    }

    return <AboutWorkflowClient steps={data} />;
  } catch (err) {
    console.error("Unexpected error:", err);
    return (
      <div className="text-red-500 text-center py-10">
        Unexpected error occurred
      </div>
    );
  }
}
