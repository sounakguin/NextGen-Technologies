import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import BlogCard from "./blogcards"; // Import the new Client Component

export default async function BlogList() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: blogs, error } = await supabase.from("blogdetails").select("*");

  if (error) {
    console.error("Supabase fetch error:", error.message);
    return (
      <div className="text-red-500 text-center py-10">Error loading blogs</div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div className="text-gray-500 text-center py-10">No blogs found</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:p-6  min-h-screen w-11/12 mx-auto">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} /> // Use the BlogCard component
      ))}
    </div>
  );
}
