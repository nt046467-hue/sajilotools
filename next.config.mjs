/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://cdnjs.cloudflare.com https://unpkg.com https://cdn.jsdelivr.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://adservice.google.com https://tpc.googlesyndication.com https://www.google.com https://www.gstatic.com https://*.adtrafficquality.google",
              "script-src-elem 'self' 'unsafe-inline' blob: https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://cdnjs.cloudflare.com https://unpkg.com https://cdn.jsdelivr.net https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://adservice.google.com https://tpc.googlesyndication.com https://www.google.com https://www.gstatic.com https://*.adtrafficquality.google",
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

  async redirects() {
    return [
      // ── 301 Permanent Redirects for legacy /tools/text/[slug] URLs ──
      // Developer Tools
      { source: "/tools/text/json-formatter", destination: "/tools/developer/json-formatter", permanent: true },
      { source: "/tools/text/base64-encoder", destination: "/tools/developer/base64-encoder", permanent: true },
      { source: "/tools/text/url-encoder", destination: "/tools/developer/url-encoder", permanent: true },
      { source: "/tools/text/hash-generator", destination: "/tools/developer/hash-generator", permanent: true },
      { source: "/tools/text/regex-tester", destination: "/tools/developer/regex-tester", permanent: true },
      { source: "/tools/text/color-picker", destination: "/tools/developer/color-picker", permanent: true },
      { source: "/tools/text/password-generator", destination: "/tools/developer/password-generator", permanent: true },
      { source: "/tools/text/lorem-ipsum", destination: "/tools/developer/lorem-ipsum", permanent: true },
      { source: "/tools/text/qr-generator", destination: "/tools/developer/qr-generator", permanent: true },
      { source: "/tools/text/timezone-converter", destination: "/tools/developer/timezone-converter", permanent: true },
      { source: "/tools/text/markdown-preview", destination: "/tools/developer/markdown-preview", permanent: true },
      { source: "/tools/text/link-shortener", destination: "/tools/developer/link-shortener", permanent: true },
      { source: "/tools/text/uuid-generator", destination: "/tools/developer/uuid-generator", permanent: true },
      { source: "/tools/text/jwt-decoder", destination: "/tools/developer/jwt-decoder", permanent: true },
      { source: "/tools/text/unix-timestamp-converter", destination: "/tools/developer/unix-timestamp-converter", permanent: true },
      { source: "/tools/text/css-js-minifier", destination: "/tools/developer/css-js-minifier", permanent: true },
      { source: "/tools/text/hmac-generator", destination: "/tools/developer/hmac-generator", permanent: true },
      { source: "/tools/text/random-token-generator", destination: "/tools/developer/random-token-generator", permanent: true },
      { source: "/tools/text/file-checksum-verifier", destination: "/tools/developer/file-checksum-verifier", permanent: true },

      // Finance Tools
      { source: "/tools/text/nrs-converter", destination: "/tools/finance/nrs-converter", permanent: true },
      { source: "/tools/text/emi-calculator", destination: "/tools/finance/emi-calculator", permanent: true },
      { source: "/tools/text/tax-calculator", destination: "/tools/finance/tax-calculator", permanent: true },
      { source: "/tools/text/interest-calculator", destination: "/tools/finance/interest-calculator", permanent: true },
      { source: "/tools/text/pf-calculator", destination: "/tools/finance/pf-calculator", permanent: true },
      { source: "/tools/text/gold-silver-calculator", destination: "/tools/finance/gold-silver-calculator", permanent: true },
      { source: "/tools/text/sip-calculator", destination: "/tools/finance/sip-calculator", permanent: true },
      { source: "/tools/text/fd-calculator", destination: "/tools/finance/fd-calculator", permanent: true },
      { source: "/tools/text/vat-calculator", destination: "/tools/finance/vat-calculator", permanent: true },

      // PDF Tools
      { source: "/tools/text/pdf-merger", destination: "/tools/pdf/pdf-merger", permanent: true },
      { source: "/tools/text/pdf-splitter", destination: "/tools/pdf/pdf-splitter", permanent: true },
      { source: "/tools/text/pdf-to-word", destination: "/tools/pdf/pdf-to-word", permanent: true },
      { source: "/tools/text/pdf-organizer", destination: "/tools/pdf/pdf-organizer", permanent: true },
      { source: "/tools/text/pdf-watermark", destination: "/tools/pdf/pdf-watermark", permanent: true },
      { source: "/tools/text/jpg-pdf-converter", destination: "/tools/pdf/jpg-pdf-converter", permanent: true },
      { source: "/tools/text/pdf-compressor", destination: "/tools/pdf/pdf-compressor", permanent: true },

      // Image Tools
      { source: "/tools/text/image-compressor", destination: "/tools/image/image-compressor", permanent: true },
      { source: "/tools/text/image-resizer", destination: "/tools/image/image-resizer", permanent: true },
      { source: "/tools/text/image-cropper", destination: "/tools/image/image-cropper", permanent: true },
      { source: "/tools/text/image-converter", destination: "/tools/image/image-converter", permanent: true },
      { source: "/tools/text/image-to-base64", destination: "/tools/image/image-to-base64", permanent: true },
      { source: "/tools/text/background-remover", destination: "/tools/image/background-remover", permanent: true },
      { source: "/tools/text/favicon-generator", destination: "/tools/image/favicon-generator", permanent: true },
      { source: "/tools/text/image-watermark", destination: "/tools/image/image-watermark", permanent: true },
      { source: "/tools/text/image-rotate-flip", destination: "/tools/image/image-rotate-flip", permanent: true },

      // Nepal Tools
      { source: "/tools/text/land-converter", destination: "/tools/nepal/land-converter", permanent: true },
      { source: "/tools/text/nepali-translator", destination: "/tools/nepal/nepali-translator", permanent: true },
      { source: "/tools/text/nepali-date-converter", destination: "/tools/nepal/nepali-date-converter", permanent: true },
      { source: "/tools/text/nepali-unicode", destination: "/tools/nepal/nepali-unicode", permanent: true },
      { source: "/tools/text/nepali-number-words", destination: "/tools/nepal/nepali-number-words", permanent: true },
      { source: "/tools/text/nepali-calendar", destination: "/tools/nepal/nepali-calendar", permanent: true },
      { source: "/tools/text/traditional-unit-converter", destination: "/tools/nepal/traditional-unit-converter", permanent: true },
      { source: "/tools/text/vehicle-tax-calculator", destination: "/tools/nepal/vehicle-tax-calculator", permanent: true },
      { source: "/tools/text/ward-municipality-lookup", destination: "/tools/nepal/ward-municipality-lookup", permanent: true },

      // Everyday Tools
      { source: "/tools/text/unit-converter", destination: "/tools/everyday/unit-converter", permanent: true },
      { source: "/tools/text/percentage-calculator", destination: "/tools/everyday/percentage-calculator", permanent: true },
      { source: "/tools/text/gpa-percentage-converter", destination: "/tools/everyday/gpa-percentage-converter", permanent: true },
      { source: "/tools/text/bmi-calculator", destination: "/tools/everyday/bmi-calculator", permanent: true },
      { source: "/tools/text/discount-calculator", destination: "/tools/everyday/discount-calculator", permanent: true },
      { source: "/tools/text/bmr-calculator", destination: "/tools/everyday/bmr-calculator", permanent: true },
      { source: "/tools/text/calorie-calculator", destination: "/tools/everyday/calorie-calculator", permanent: true },
    ];
  },
};

export default nextConfig;

