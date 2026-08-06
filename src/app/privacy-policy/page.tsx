import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SajiloTools",
  description:
    "SajiloTools Privacy Policy explaining data privacy, local browser processing, cookies, and Google AdSense advertising policies.",
  alternates: {
    canonical: "https://sajilotools.vercel.app/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="text-[#18181B] dark:text-[#F4F4F5] px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-8 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] p-8 rounded-3xl shadow-sm">
          <div className="border-b border-[#E4E0D8] dark:border-[#1E2338] pb-6">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-xs text-[#A1A1AA] mt-1">Last Updated: August 6, 2026</p>
          </div>

          <div className="space-y-6 text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5]">1. Overview</h2>
              <p>
                At SajiloTools (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), user privacy is paramount. This Privacy Policy outlines how SajiloTools handles data processing, client-side execution, browser cookies, and online advertising partners.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5]">2. Client-Side Data Processing</h2>
              <p>
                The vast majority of online tools on SajiloTools (such as JSON Formatter, Base64 Encoder, Word Counter, Hash Generator, Regex Tester, QR Generator, and Calculators) run entirely in your web browser using client-side JavaScript.
              </p>
              <p>
                Your input text, code snippets, uploaded files, or generated outputs remain inside your local browser instance and are never uploaded to our servers, stored remotely, or shared with third parties.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5]">3. Local Storage & Preferences</h2>
              <p>
                We use browser <code className="bg-[#F4F4F5] dark:bg-[#1E2338] px-1.5 py-0.5 rounded text-xs">localStorage</code> solely to save your UI preferences (such as light/dark mode selection, favorited tools, and recently used tool history). This data is stored locally on your device and is never sent to our servers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5]">4. Google AdSense & Third-Party Cookies</h2>
              <p>
                SajiloTools partners with Google AdSense to serve advertisements on our website. To comply with Google AdSense policies, please note the following regarding cookies and advertising:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
                <li>
                  Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to SajiloTools or other websites across the Internet.
                </li>
                <li>
                  Google&apos;s use of advertising cookies enables it and its partners to serve relevant advertisements to users based on their visit history to our site and/or other sites on the Internet.
                </li>
                <li>
                  Users may opt out of personalized advertising by visiting{" "}
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0D9488] dark:text-[#F5A623] underline"
                  >
                    Google Ads Settings
                  </a>{" "}
                  or by visiting{" "}
                  <a
                    href="https://www.aboutads.info"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0D9488] dark:text-[#F5A623] underline"
                  >
                    www.aboutads.info
                  </a>
                  .
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5]">5. Contact Information</h2>
              <p>
                If you have questions or concerns regarding this Privacy Policy or data privacy on SajiloTools, please contact us at{" "}
                <a
                  href="mailto:sajilotool@gmail.com"
                  className="text-[#0D9488] dark:text-[#F5A623] underline"
                >
                  sajilotool@gmail.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
