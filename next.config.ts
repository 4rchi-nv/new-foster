import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const parsed = new URL(site);

const nextConfig: NextConfig = {
  agentRules: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "/api/**" },
      { protocol: parsed.protocol.replace(":", "") as "http" | "https", hostname: parsed.hostname, pathname: "/api/**" },
    ],
  },
};

export default withPayload(nextConfig);
