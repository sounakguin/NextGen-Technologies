import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

// Function to safely extract plain text from JSON description
const extractPlainText = (description: string): string => {
  if (!description) return "No description available";

  try {
    const parsed = JSON.parse(description);
    if (parsed?.type === "doc" && Array.isArray(parsed.content)) {
      return parsed.content
        .map((block: { type: string; content?: { text: string }[] }) =>
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

  return description;
};

export default async function BlogtextContent() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.from("blogtext").select("*");

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return (
        <div className="text-red-500 text-center py-10">
          Error loading blogs
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-gray-500 text-center py-10">No blogs found</div>
      );
    }

    return (
      <div className="w-11/12 mx-auto py-10 px-4 sm:px-6 lg:px-12 text-white text-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8">
            Latest Blogs
          </h2>

          <div className="">
            {data.map((blog) => (
              <div
                key={blog.id}
                className="  rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-[1.02]"
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-3">
                  {blog.title || "No Title"}
                </h3>
                <p className="text-sm mx-auto sm:text-base leading-relaxed">
                  {extractPlainText(blog.description)}
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
