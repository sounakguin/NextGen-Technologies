import React from "react";
import { cookies } from "next/headers"; // Server-side authentication
import { createClient } from "@/utils/supabase/server";

// Type definitions
interface TextBlock {
  text: string;
}

interface ContentBlock {
  type: string;
  content?: TextBlock[];
}

interface PricingText {
  id: number;
  title: string;
  description: string;
}

// Function to safely extract plain text from JSON description
const extractPlainText = (description: string): string => {
  if (!description) return "No description available";

  try {
    const parsed = JSON.parse(description);

    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      return parsed.content
        .map((block: ContentBlock) =>
          block?.type === "paragraph" && Array.isArray(block.content)
            ? block.content.map((textBlock) => textBlock.text || "").join(" ")
            : ""
        )
        .join(" ")
        .trim();
    }
  } catch (error) {
    console.error("Error parsing description:", error);
  }

  return description; // Fallback to raw text if parsing fails
};

export default async function PricingTextContent() {
  try {
    // Retrieve cookies & initialize Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Fetch pricing text data from Supabase
    const { data, error } = await supabase.from("pricingtext").select("*");

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return (
        <div className="text-red-500 text-center py-10">
          Error loading pricing text
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-gray-500 text-center py-10">
          No pricing information available
        </div>
      );
    }

    return (
      <div className="w-full py-10 flex flex-col items-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white text-lg sm:text-xl md:text-2xl font-semibold">
            Clear & Simple Pricing
          </p>
          <div className="space-y-4 flex flex-col items-center ">
            {data.map((pricing: PricingText) => (
              <div
                key={pricing.id}
                className="p-6 sm:p-8 rounded-lg shadow-md  text-white mx-auto text-center"
              >
                <h3 className="text-2xl sm:text-3xl md:text-[35px] font-bold mb-2">
                  {pricing.title || "No Title"}
                </h3>
                <p className="text-md sm:text-lg w-full lg:w-[70%] mx-auto leading-relaxed">
                  {extractPlainText(pricing.description)}
                </p>
              </div>
            ))}
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
