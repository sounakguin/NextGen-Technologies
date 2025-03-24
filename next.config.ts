/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zmwbydojgxsajppvzalk.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/Images/**",
      },
    ],
  },
};

export default nextConfig;
