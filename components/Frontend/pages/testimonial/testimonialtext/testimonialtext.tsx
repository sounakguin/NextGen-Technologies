import React from "react";
import { cookies } from "next/headers"; // Server-side authentication
import { createClient } from "@/utils/supabase/server";

// Function to safely extract plain text from JSON description
const extractPlainText = (description: string): string => {
  if (!description) return "No description available";

  try {
    const parsed = JSON.parse(description) as {
      type: string;
      content: { type: string; content: { text: string }[] }[];
    };
    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      return parsed.content
        .map((block: { type: string; content: { text: string }[] }) =>
          block.type === "paragraph" && Array.isArray(block.content)
            ? block.content
                .map((textBlock: { text: string }) => textBlock.text)
                .join(" ")
            : ""
        )
        .join(" ")
        .trim();
    }
  } catch (e) {
    console.error("Error parsing description:", e);
  }

  return description;
};

export default async function Testimonialtextcontent() {
  try {
    // Retrieve cookies & initialize Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Fetch testimonials data from Supabase
    const { data, error } = await supabase.from("testimonialstext").select("*");

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return (
        <div className="text-red-500 text-center py-10">
          Error loading testimonials
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-gray-500 text-center py-10">
          No testimonials found
        </div>
      );
    }

    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto mt-10 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg sm:text-xl font-bold text-center mb-6 sm:mb-8">
            Testimonials
          </h2>
          <div className="space-y-8">
            {data.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex flex-col items-center text-center"
              >
                <h3 className="text-xl sm:text-2xl md:text-[35px] font-bold mb-2">
                  {testimonial.title || "No Title"}
                </h3>
                <p className="text-sm sm:text-md md:text-lg w-full sm:w-3/4 md:w-1/2 mx-auto">
                  {extractPlainText(testimonial.description)}
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
