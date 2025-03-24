import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import TestimonialSlider from "./TestimonialSliderclient"; // Import the Client Component

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

export default async function TestimonialImages() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("testimonialscards").select("*");

  if (error) {
    console.error("Supabase fetch error:", error.message);
    return <div>Error loading testimonials</div>;
  }

  // Extract plain text from descriptions
  const testimonials = data.map((testimonial) => ({
    ...testimonial,
    description: extractPlainText(testimonial.description),
  }));

  return (
    <div>
      <TestimonialSlider testimonials={testimonials} />
    </div>
  );
}
