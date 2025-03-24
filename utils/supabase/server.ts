import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Function to create and return the Supabase client
export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, // Get Supabase URL from environment variable
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Get Supabase anon key from environment variable
    {
      cookies: {
        async getAll() {
          return (await cookieStore).getAll(); // Retrieve all cookies from the client-side cookies store
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(async ({ name, value, options }) =>
              (await cookieStore).set(name, value, options)
            ); // Set cookies on the client
          } catch (error) {
            // This is expected to happen if you're handling the cookies server-side
            console.error("Error setting cookies:", error);
          }
        },
      },
    }
  );
};
