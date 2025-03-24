import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

// Define types for content and testimonial data
interface TextContent {
  text: string;
}

interface Block {
  type: string;
  content?: TextContent[];
}

interface Testimonial {
  id: number;
  title: string;
  description: string;
}

// Function to safely extract plain text from JSON description
const extractPlainText = (description: string): string => {
  if (!description) return "No description available"; // Handle empty description

  try {
    const parsed = JSON.parse(description);
    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      return parsed.content
        .map((block: Block) =>
          block?.type === "paragraph" && block.content
            ? block.content.map((textBlock) => textBlock.text).join(" ")
            : ""
        )
        .join(" ")
        .trim();
    }
  } catch (e) {
    console.error("Error parsing description:", e);
  }

  return description; // Fallback to raw text if parsing fails
};

export default async function TemplateTextContent() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Fetch testimonials data from Supabase
    const { data, error } = await supabase.from("templatetext").select("*");

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
      <div className="w-full py-10 bg-white flex justify-center items-center">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="space-y-6">
            {data.map((testimonial: Testimonial) => (
              <div key={testimonial.id}>
                <h3 className="text-[40px] font-bold mb-2">
                  {testimonial.title || "No Title"}
                </h3>
                <p className="w-[90%] text-center text-md">
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
