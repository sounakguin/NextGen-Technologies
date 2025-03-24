import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import FAQList from "./faqlist";

export default async function FAQs() {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Fetch FAQs data from Supabase
    const { data, error } = await supabase
      .from("faqsquestionandanswer")
      .select("*");

    if (error) {
      console.error("Supabase fetch error:", error.message);
      return (
        <div className="text-red-500 text-center py-10">Error loading FAQs</div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-gray-500 text-center py-10">No FAQs found</div>
      );
    }

    return <FAQList faqs={data} />;
  } catch (err) {
    console.error("Unexpected error:", err);
    return (
      <div className="text-red-500 text-center py-10">
        Unexpected error occurred
      </div>
    );
  }
}
