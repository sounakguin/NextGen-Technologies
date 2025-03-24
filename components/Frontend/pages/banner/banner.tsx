import React from "react";
import { cookies } from "next/headers"; // Server-side authentication
import { createClient } from "@/utils/supabase/server";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";

export default async function Banner() {
  try {
    // Retrieve cookies & initialize Supabase client
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Fetch banner data from Supabase
    const { data, error } = await supabase.from("banner").select("*").single();

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return (
        <div className="text-red-500 text-center py-10">
          Error loading banner
        </div>
      );
    }

    if (!data) {
      return (
        <div className="text-gray-500 text-center py-10">
          No banner data found
        </div>
      );
    }

    // Function to safely extract text from JSON description
    const extractPlainText = (description: string): string => {
      if (!description) return "No description available"; // Handle empty description

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

      return description; // Fallback to original text
    };

    const plainTextDescription = extractPlainText(data.description);
    const backgroundImage = data.image || "/default-banner.jpg"; // Default fallback image

    return (
      <div className="relative w-full h-[400px] md:h-[650px] lg:h-[750px] bg-[#111204] flex items-center justify-center text-white">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />

        {/* Text Content */}
        <div className="relative z-10 text-center flex flex-col items-center justify-center w-full h-full px-4 md:px-8">
          <h1 className="text-[38px] sm:text-5xl md:text-6xl lg:text-[80px] font-bold mb-6 leading-tight md:leading-[80px] w-full sm:w-[80%] md:w-[60%]">
            {data.title?.split(" ").map((word: string, index: number) =>
              word.toLowerCase() === "webminis" ? (
                <span key={index} className="text-[#2FD31D] italic">
                  {word}
                </span>
              ) : (
                <span key={index}>{word} </span>
              )
            )}
          </h1>

          <p className="text-sm sm:text-md md:text-lg mb-6 w-full sm:w-[70%] md:w-[50%]">
            {plainTextDescription}
          </p>
          <div className="flex justify-center">
            <CustomButton variant="green">Get Started</CustomButton>
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
