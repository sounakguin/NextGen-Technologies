import React from "react";
import Image from "next/image";
import { cn } from "../../../../../lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

interface ReviewCardProps {
  img: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ img }) => {
  return (
    <figure className={cn("flex items-center justify-center h-[170px]")}>
      <Image
        className="h-full w-auto object-cover"
        width={170}
        height={170}
        alt="Client Image"
        src={img}
        priority
      />
    </figure>
  );
};

export default async function TemplateImages() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch all images from Supabase
  const { data: images, error } = await supabase
    .from("templates")
    .select("image");

  if (error) {
    console.error("Error fetching images:", error);
    return <div>Error loading images.</div>;
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full overflow-hidden -space-y-6">
      {/* First Marquee - Right to Left */}
      <Marquee pauseOnHover className="[--duration:20s]">
        {images.map((item, index) => (
          <ReviewCard key={`top-${index}`} img={item.image} />
        ))}
      </Marquee>

      {/* Second Marquee - Left to Right */}
      <Marquee pauseOnHover className="[--duration:20s]" reverse>
        {images.map((item, index) => (
          <ReviewCard key={`middle-${index}`} img={item.image} />
        ))}
      </Marquee>

      {/* Third Marquee - Right to Left */}
      <Marquee pauseOnHover className="[--duration:20s]">
        {images.map((item, index) => (
          <ReviewCard key={`bottom-${index}`} img={item.image} />
        ))}
      </Marquee>

      {/* Gradient Fades on the sides */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
}
