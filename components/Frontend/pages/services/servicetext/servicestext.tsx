import React from "react";
import { cookies } from "next/headers"; // Server-side authentication
import { createClient } from "@/utils/supabase/server";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";

export default async function AboutSectiontext() {
  try {
    // Retrieve cookies & initialize Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Fetch about text data from Supabase
    const { data, error } = await supabase
      .from("servicestext")
      .select("title, subtitle, description")
      .single();

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return (
        <div className="text-red-500 text-center py-10">
          Error loading about text
        </div>
      );
    }

    if (!data) {
      return (
        <div className="text-gray-500 text-center py-10">
          No about text data found
        </div>
      );
    }

    // Function to safely extract text from JSON description
    const extractPlainText = (description: string) => {
      if (!description) return "No description available";
      try {
        const parsed = JSON.parse(description) as {
          type: string;
          content: { type: string; content: { text: string }[] }[];
        };
        if (parsed.type === "doc" && Array.isArray(parsed.content)) {
          return parsed.content
            .map((block: { type: string; content: { text: string }[] }) =>
              block.type === "paragraph"
                ? block.content
                    .map((textBlock: { text: string }) => textBlock.text)
                    .join(" ")
                : ""
            )
            .join(" ");
        }
      } catch (e) {
        console.error("Error parsing description:", e);
      }
      return description;
    };

    const plainTextDescription = extractPlainText(data.description);

    return (
      <div className="w-full text-white flex justify-center items-center py-20 px-6 md:px-20">
        <div className="max-w-6xl w-full flex flex-col md:flex-row items-center">
          {/* Left Section */}
          <div className="md:w-1/2 text-left">
            <p className="text-[#2FD31D] uppercase text-sm font-semibold mb-2">
              {data.subtitle}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              {data.title}
            </h1>
          </div>

          {/* Right Section */}
          <div className="md:w-1/2 text-left md:pl-10 mt-6 md:mt-0">
            <p className="text-lg text-gray-300 mb-6">{plainTextDescription}</p>
            <div className="flex gap-4">
              <CustomButton variant="green">Creator Website</CustomButton>
              <CustomButton variant="green">Business Website</CustomButton>
              <CustomButton variant="green">Marketing</CustomButton>
            </div>
          </div>
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
