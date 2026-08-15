import type { Metadata } from "next";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "SajiloTools Privacy Policy explaining data privacy, local browser processing, cookies, external API boundaries, and Google AdSense advertising policies.",
  alternates: {
    canonical: getCanonicalUrl("/privacy-policy"),
  },
  openGraph: {
    title: "Privacy Policy",
    description:
      "SajiloTools Privacy Policy explaining data privacy, local browser processing, cookies, and external API boundaries.",
    url: getCanonicalUrl("/privacy-policy"),
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
    locale: SITE_CONFIG.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy",
    description:
      "SajiloTools Privacy Policy explaining data privacy, local browser processing, cookies, and external API boundaries.",
    images: ["/images/og-default.png"],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="text-[#18181B] dark:text-[#F4F4F5] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-8 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] p-8 sm:p-10 rounded-3xl shadow-sm">
          <div className="border-b border-[#E4E0D8] dark:border-[#1E2338] pb-6">
            <h1 className="text-3xl font-bold font-sora">Privacy Policy</h1>
            <p className="text-xs text-[#A1A1AA] mt-2">Last Updated: August 15, 2026</p>
          </div>

          <div className="space-y-6 text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">1. Overview</h2>
              <p>
                At SajiloTools (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), protecting user privacy and data security is a core engineering principle. This Privacy Policy details how SajiloTools manages client-side processing, browser storage, third-party cookies, and external API data interactions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">2. Client-Side Data Processing Boundary</h2>
              <p>
                The vast majority of utilities on SajiloTools — including PDF Merger/Splitter/Compressor, Image Compressor/Resizer, JSON Formatter, Base64 Encoder, Password Generator, Hash Generator, Regex Tester, QR Generator, and financial calculators — run <strong>100% locally inside your web browser sandbox</strong>.
              </p>
              <p>
                Your raw text snippets, code payloads, uploaded images, PDF documents, and calculated numeric inputs remain strictly within your device&apos;s volatile browser memory. They are never uploaded to our servers, logged, transmitted over network calls, or stored remotely.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">3. Server-Assisted Tools Disclosure</h2>
              <p>
                A small subset of tools require fetching external live reference data or server processing:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
                <li><strong>NRs Currency Converter:</strong> Retrieves official daily foreign exchange reference rates published by Nepal Rastra Bank (NRB).</li>
                <li><strong>English ↔ Nepali Translator:</strong> Transmits translation query text via our server-side API to third-party translation providers, specifically Google Translate and MyMemory, for processing. Translation results are cached in our server-side cache (Vercel KV) for up to 30 days to improve response times. The cache key includes a normalized form of the input text. Raw query inputs are not separately logged, sold, or retained beyond the cache. These third-party providers are subject to their own privacy policies.</li>
                <li><strong>Link Shortener:</strong> Stores original target destination URLs and custom slug aliases in an encrypted database to enable short URL redirection.</li>
                <li><strong>Gold & Silver Calculator:</strong> Fetches market price reference feeds published by FENEGOSIDA.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">4. Local Storage & Preferences</h2>
              <p>
                We use browser <code className="bg-[#F4F4F5] dark:bg-[#1E2338] px-1.5 py-0.5 rounded text-xs">localStorage</code> solely to save your local UI preferences (such as light/dark mode selection, favorited tool shortcuts, and recent tool history). This data is stored locally on your physical device and is never synchronized to external servers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">5. Google AdSense & Third-Party Cookies</h2>
              <p>
                SajiloTools displays non-intrusive advertisements served by Google AdSense. Google and third-party advertising vendors use cookies to serve ads based on a user&apos;s prior visits to SajiloTools or other websites on the internet.
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
                <li>
                  Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit history across the web.
                </li>
                <li>
                  Users may opt out of personalized advertising by visiting{" "}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1F2544] dark:text-[#F5A623] underline font-medium"
                  >
                    Google Ads Settings
                  </a>{" "}
                  or by managing cookie consent via the Cookie Preferences button in our footer.
                </li>
                <li>
                  For additional information on how Google manages advertising data, see{" "}
                  <a
                    href="https://policies.google.com/technologies/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1F2544] dark:text-[#F5A623] underline font-medium"
                  >
                    Google&apos;s Advertising Privacy Terms
                  </a>.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">6. Children&apos;s Privacy</h2>
              <p>
                SajiloTools does not knowingly collect personal identifiable information from children under the age of 13. Our utilities are safe, educational, and open for general audience use without mandatory account creation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">7. Contact Information</h2>
              <p>
                For questions, concerns, or data privacy inquiries regarding SajiloTools, please email us at{" "}
                <a
                  href="mailto:sajilotool@gmail.com"
                  className="text-[#1F2544] dark:text-[#F5A623] underline font-semibold"
                >
                  sajilotool@gmail.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
