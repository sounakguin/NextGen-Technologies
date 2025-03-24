import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import AboutSectionClient from "./abouttext";

export default async function AboutSectionServer() {
  try {
    // Retrieve cookies & initialize Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Fetch about text data from Supabase
    const { data, error } = await supabase
      .from("abouttext")
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
    const extractPlainText = (description: string): string => {
      if (!description) return "No description available";
      try {
        const parsed = JSON.parse(description) as {
          type: string;
          content: { type: string; content: { text: string }[] }[];
        };
        if (parsed.type === "doc" && Array.isArray(parsed.content)) {
          return parsed.content
            .map((block) =>
              block.type === "paragraph"
                ? block.content.map((textBlock) => textBlock.text).join(" ")
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

    // Pass data to the client component
    return (
      <AboutSectionClient
        title={data.title}
        subtitle={data.subtitle}
        description={plainTextDescription}
      />
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
