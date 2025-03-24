import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

interface ServiceWMUDData {
  title: string;
  subtitle: string;
}

export default async function ServicesWMUD() {
  try {
    // Initialize Supabase client with cookies
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Fetch data from Supabase
    const { data, error } = await supabase
      .from("serviceswhatmakesusdifferent")
      .select("title, subtitle")
      .single<ServiceWMUDData>();

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return (
        <div className="text-red-500 text-center py-10">Error loading data</div>
      );
    }

    if (!data) {
      return (
        <div className="text-gray-500 text-center py-10">No data found</div>
      );
    }

    return (
      <div className="w-full flex justify-center items-center  px-6 sm:px-10 lg:px-16 text-white">
        <div className="max-w-6xl w-full flex flex-col text-center sm:text-left">
          {/* Subtitle */}
          <p className="text-green-400 uppercase text-sm sm:text-base font-semibold mb-3">
            {data.subtitle}
          </p>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug">
            {data.title}
          </h1>
        </div>
      </div>
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return (
      <div className="text-red-500 text-center py-10">
        Unexpected error occurred
      </div>
    );
  }
}
