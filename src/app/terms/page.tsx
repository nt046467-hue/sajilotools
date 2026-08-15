import type { Metadata } from "next";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use and service agreement for accessing SajiloTools web utilities.",
  alternates: {
    canonical: getCanonicalUrl("/terms"),
  },
  openGraph: {
    title: "Terms of Use",
    description: "Terms of Use and service agreement for accessing SajiloTools web utilities.",
    url: getCanonicalUrl("/terms"),
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
    locale: SITE_CONFIG.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Use",
    description: "Terms of Use and service agreement for accessing SajiloTools web utilities.",
    images: ["/images/og-default.png"],
  },
};

export default function TermsPage() {
  return (
    <div className="text-[#18181B] dark:text-[#F4F4F5] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-8 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] p-8 sm:p-10 rounded-3xl shadow-sm">
          <div className="border-b border-[#E4E0D8] dark:border-[#1E2338] pb-6">
            <h1 className="text-3xl font-bold font-sora">Terms of Use</h1>
            <p className="text-xs text-[#A1A1AA] mt-2">Last Updated: August 15, 2026</p>
          </div>

          <div className="space-y-6 text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">1. Acceptance of Terms</h2>
              <p>
                By accessing, browsing, or using SajiloTools (&quot;Platform&quot;), you acknowledge that you have read, understood, and agree to be legally bound by these Terms of Use. If you do not agree with any part of these terms, please discontinue use of the Platform immediately.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">2. Permitted Use & Service Availability</h2>
              <p>
                SajiloTools provides digital conversion, text editing, file processing, and financial calculation tools for personal, educational, and commercial purposes free of charge. You agree not to misuse the Platform, attempt automated scraping/denial-of-service attacks, reverse engineer non-public backend APIs, or bypass rate limits.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">3. Accuracy & Financial / Legal Disclaimer</h2>
              <p>
                Calculations and outputs provided by SajiloTools — including Nepal salary TDS estimates, EMI schedules, land unit conversions (Ropani/Bigha), NRs exchange rates, vehicle blue book tax estimations, and GPA calculations — are provided for informational and convenience purposes only.
              </p>
              <p>
                While we strive for 100% accuracy based on official published sources (such as IRD, NRB, and FENEGOSIDA), outputs do not constitute official financial, tax, or legal advice. Users must independently verify calculations with certified accountants or official government bodies before signing legal or financial documents.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">4. Intellectual Property & User Generated Content</h2>
              <p>
                All software code, designs, logos, typography, and original written tool descriptions on SajiloTools are owned by SajiloTools. You retain full ownership of any text, images, or documents you process through our tools. SajiloTools claims no rights or ownership over your output files.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">5. Third-Party Links & Advertising</h2>
              <p>
                The Platform contains third-party advertisements served via Google AdSense and links to external resources. SajiloTools is not responsible for the content, privacy policies, or practices of third-party websites or services linked to or advertised on our platform.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">6. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, SajiloTools and its maintainers shall not be liable for any direct, indirect, incidental, consequential, or punitive damages resulting from your use of, or inability to use, our services or reliance on calculated outputs.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">7. Modifications to Terms</h2>
              <p>
                We reserve the right to revise these Terms of Use at any time without prior notice. Updated terms will be posted directly on this page with a revised &quot;Last Updated&quot; date.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5] font-sora">8. Contact Information</h2>
              <p>
                If you have questions regarding these Terms of Use, please contact us at{" "}
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
