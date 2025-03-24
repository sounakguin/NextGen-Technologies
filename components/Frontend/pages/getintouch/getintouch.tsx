import React from "react";
import { cookies } from "next/headers"; // Server-side authentication
import { createClient } from "@/utils/supabase/server";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";

export default async function GetInTouch() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("getintouch").select("*");

  if (error) {
    console.error("Error fetching data:", error.message);
    return <p className="text-white">Error loading data...</p>;
  }

  return (
    <div
      className="absolute left-1/2 transform -translate-x-1/2 
                 w-11/12 lg:w-6xl min-h-[300px] bg-cover bg-center 
                 flex flex-col items-center justify-center p-6 rounded-3xl 
                 bg-[#1E2008] z-20 
                 -bottom-[9600px] 2xl:-bottom-[6200px]"
      style={{ backgroundImage: "url('/Others/bg.png')" }} // Update image path if needed
    >
      {data.length > 0 ? (
        data.map((item) => (
          <div key={item.id} className="text-center text-white">
            <h2 className="text-3xl font-bold">{item.title}</h2>
            <p className="text-lg mt-2">{item.subtitle}</p>
            <CustomButton variant="green" className="mt-4 mx-auto">
              Contact US
            </CustomButton>
          </div>
        ))
      ) : (
        <p className="text-white">No data available</p>
      )}
    </div>
  );
}
