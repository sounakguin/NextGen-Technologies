import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import ServiceCardsClient from "./servicecardsclient";

export default async function ServiceCards() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Fetch service cards from the database
    const { data, error } = await supabase
      .from("servicescards")
      .select("title, image, description")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching service cards:", error.message);
      return (
        <div className="text-red-500 text-center py-10">
          Failed to load services
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-gray-500 text-center py-10">
          No services available
        </div>
      );
    }

    return <ServiceCardsClient services={data} />;
  } catch (err) {
    console.error("Unexpected error:", err);
    return (
      <div className="text-red-500 text-center py-10">
        Unexpected error occurred
      </div>
    );
  }
}
