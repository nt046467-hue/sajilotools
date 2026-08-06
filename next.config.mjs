/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "motion",
      "clsx",
      "tailwind-merge",
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Critical dependency: require function is used in a way in which dependencies cannot be statically extracted/,
    ];

    if (!isServer) {
      // ── @imgly/background-removal + onnxruntime-web fixes ──────────────
      config.module.rules.push({
        test: /\.m?js$/,
        include: /node_modules[\\/](@imgly[\\/]background-removal|onnxruntime-web)/,
        type: "javascript/auto",
        parser: {
          url: false,
        },
      });

      if (config.optimization?.minimizer) {
        for (const plugin of config.optimization.minimizer) {
          if (plugin.constructor?.name === "TerserPlugin") {
            const prev = plugin.options.exclude;
            plugin.options.exclude = prev
              ? [].concat(prev, /ort.*\.min\.mjs$/, /ort-wasm.*\.mjs$/)
              : [/ort.*\.min\.mjs$/, /ort-wasm.*\.mjs$/];
          }
        }
      }

      // Redirect the optional WebGPU entry-point to regular WASM build
      config.resolve.alias["onnxruntime-web/webgpu"] = "onnxruntime-web";
    }

    return config;
  },

  async headers() {
    return [
      // ── Global security headers ──────────────────────────────────────────
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://cdnjs.cloudflare.com https://unpkg.com https://cdn.jsdelivr.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://adservice.google.com https://tpc.googlesyndication.com https://www.google.com https://www.gstatic.com",
              "script-src-elem 'self' 'unsafe-inline' blob: https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://cdnjs.cloudflare.com https://unpkg.com https://cdn.jsdelivr.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://adservice.google.com https://tpc.googlesyndication.com https://www.google.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https: https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.google.com https://*.doubleclick.net",
              "connect-src 'self' blob: data: https://www.google-analytics.com https://vitals.vercel-insights.com https://*.vercel-scripts.com https://cdn.jsdelivr.net https://unpkg.com https://staticimgly.com https://*.staticimgly.com https://cdnjs.cloudflare.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://adservice.google.com https://pagead2.googleadservices.com https://*.adtrafficquality.google",
              "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://pagead2.googlesyndication.com https://www.google.com https://rc-epay.esewa.com.np https://epay.esewa.com.np https://khalti.com https://a.khalti.com",
              "form-action 'self' https://rc-epay.esewa.com.np https://epay.esewa.com.np https://khalti.com https://a.khalti.com",
              "worker-src 'self' blob: https://cdnjs.cloudflare.com https://unpkg.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // ── COEP/COOP for AI Background Remover (WebAssembly/SharedArrayBuffer) ──
      {
        source: "/tools/image/background-remover",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
      // ── Immutable caching for static assets ──
      {
        source: "/:all*(svg|jpg|png|webp|avif|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

