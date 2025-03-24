import React from "react";
import { cn } from "../../../../lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import { cookies } from "next/headers"; // Server-side authentication
import { createClient } from "@/utils/supabase/server";
import Image from "next/image"; // Added for image optimization

interface ReviewCardProps {
  img: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ img }) => {
  return (
    <figure
      className={cn(
        "relative h-full w-full cursor-pointer flex justify-center items-center gap-5 bg-white "
      )}
    >
      <div className="flex items-center justify-center">
        {/* Replaced <img> with Next.js <Image> component for optimization */}
        <Image
          className="rounded-full"
          width={128}
          height={128}
          alt="Client Image"
          src={img}
        />
      </div>
    </figure>
  );
};

export default async function Clientels() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch all images from Supabase without limiting the results
  const { data: images, error } = await supabase
    .from("clientel")
    .select("image");

  if (error) {
    console.error("Error fetching images:", error);
    return <div>Error loading images.</div>;
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full overflow-hidden py-8 bg-[#111204]">
      <div className="mb-6 text-center ">
        <p className="text-lg font-semibold tracking-wide text-white">
          TRUSTED BY AMAZING BRANDS
        </p>
      </div>
      <div className="w-full bg-white">
        <Marquee pauseOnHover className="[--duration:20s]">
          {images.map((item, index) => (
            <ReviewCard key={index} img={item.image} />
          ))}
        </Marquee>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
}
