import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  // Opt-in for restricted Windows environments that block child processes.
  experimental:
    process.env.NEXT_BUILD_WORKER_THREADS === "1"
      ? { workerThreads: true, useTypeScriptCli: false, cpus: 2 }
      : {},
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
