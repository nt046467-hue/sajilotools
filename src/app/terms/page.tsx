import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | SajiloTools",
  description: "Terms of Use for SajiloTools web utilities.",
  alternates: {
    canonical: "https://sajilotools.vercel.app/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="text-[#18181B] dark:text-[#F4F4F5] px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-8 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] p-8 rounded-3xl shadow-sm">
          <div className="border-b border-[#E4E0D8] dark:border-[#1E2338] pb-6">
            <h1 className="text-3xl font-bold">Terms of Use</h1>
            <p className="text-xs text-[#A1A1AA] mt-1">Last Updated: July 22, 2026</p>
          </div>

          <div className="space-y-6 text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5]">1. Acceptance of Terms</h2>
              <p>
                By accessing and using SajiloTools, you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the website.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5]">2. Permitted Use</h2>
              <p>
                SajiloTools provides digital conversion, formatting, and calculation utilities for personal, educational, and commercial purposes free of charge. You agree not to misuse the platform, attempt unauthorized API access, or disrupt website availability.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5]">3. Disclaimer of Warranties</h2>
              <p>
                All tools and calculated outputs (such as tax estimations, land conversions, and currency calculations) are provided &quot;as is&quot; for informational purposes without warranty of any kind. Users should verify official financial or legal documents independently.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-[#18181B] dark:text-[#F4F4F5]">4. Limitation of Liability</h2>
              <p>
                In no event shall SajiloTools or its maintainers be liable for any direct, indirect, incidental, or consequential damages resulting from the use of our services.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
