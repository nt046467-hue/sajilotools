import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ShieldCheck, Scale, FileText, Info } from "lucide-react";
import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Disclaimer – Legal & Financial Use Notices",
  description:
    "Disclaimer and limitation of liability for SajiloTools online calculators, date converters, translation tools, and financial utilities.",
  alternates: {
    canonical: getCanonicalUrl("/disclaimer"),
  },
  openGraph: {
    title: "Disclaimer – Legal & Financial Use Notices",
    description:
      "Important terms, calculation limitations, and legal disclaimers for SajiloTools web utilities.",
    url: getCanonicalUrl("/disclaimer"),
    siteName: SITE_CONFIG.name,
    images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
    locale: SITE_CONFIG.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Disclaimer – Legal & Financial Use Notices",
    description:
      "Important terms, calculation limitations, and legal disclaimers for SajiloTools web utilities.",
    images: ["/images/og-default.png"],
  },
};

export default function DisclaimerPage() {
  return (
    <div className="text-[#18181B] dark:text-[#F4F4F5] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] text-xs font-semibold text-[#F5A623]">
            <AlertTriangle size={14} /> LEGAL &amp; CALCULATION NOTICE
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-sora">
            Website &amp; Utility Disclaimer
          </h1>
          <p className="text-sm sm:text-base text-[#71717A] dark:text-[#A1A1AA] max-w-2xl mx-auto">
            Last Updated: August 2026. Please read this disclaimer carefully before using any calculators, conversion utilities, or tools on SajiloTools.
          </p>
        </div>

        {/* General Disclaimer */}
        <div className="p-8 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-lg font-bold font-sora">
            <Info className="text-blue-500" size={22} />
            <h2>1. General Information &amp; Educational Purpose</h2>
          </div>
          <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            The information, tools, converters, calculators, and documentation provided on <strong>SajiloTools</strong> (nabint.com.np) are provided for general informational, educational, and quick estimation purposes only. All utilities on this platform are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, whether express or implied.
          </p>
        </div>

        {/* Financial & Tax Disclaimer */}
        <div className="p-8 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-lg font-bold font-sora">
            <Scale className="text-emerald-500" size={22} />
            <h2>2. Financial, Taxation &amp; Legal Disclaimer</h2>
          </div>
          <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            Our financial calculators — including the Nepal Income Tax Calculator, Salary TDS Estimator, EMI Calculator, Provident Fund (SSF/EPF) Calculator, Gold &amp; Silver Rate Calculator, and VAT Calculator — are designed based on prevailing statutory rates (such as Nepal Inland Revenue Department tax slabs and NRB reference guidelines).
          </p>
          <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            However, these calculations do <strong>not</strong> constitute formal financial, accounting, legal, or tax advice. Personal tax liability can vary based on individual tax credits, medical insurance reliefs, marital filing status, and municipal allowances. Always consult a certified Chartered Accountant (CA), registered tax consultant, or official government authority before making financial commitments or filing tax returns.
          </p>
        </div>

        {/* Date Conversion & Official Documents */}
        <div className="p-8 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-lg font-bold font-sora">
            <FileText className="text-amber-500" size={22} />
            <h2>3. Date Conversion &amp; Land Measurement Accuracy</h2>
          </div>
          <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            While our Bikram Sambat (BS) to Gregorian (AD) Date Converter and Land Unit Converter (Ropani, Aana, Bigha, Kattha) use validated mathematical algorithms and official historical almanac data, slight variations may exist in historical regional records or cadastral survey offices. Users should cross-check vital dates and boundary figures with official citizenship certificates, passports, or Land Revenue Office (Malpot Karyalaya) records.
          </p>
        </div>

        {/* Machine Translation Disclaimer */}
        <div className="p-8 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-lg font-bold font-sora">
            <ShieldCheck className="text-purple-500" size={22} />
            <h2>4. Automated Machine Translation</h2>
          </div>
          <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            The English &harr; Nepali translation tool utilizes automated neural machine translation. While effective for casual communication and study, machine translation may contain grammatical nuances or context inaccuracies. Do not use automated translation for sworn legal affidavits, court proceedings, or medical documents without human verification.
          </p>
        </div>

        {/* Third-Party Advertising & Links */}
        <div className="p-8 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-lg font-bold font-sora">
            <AlertTriangle className="text-rose-500" size={22} />
            <h2>5. External Links &amp; Advertisements</h2>
          </div>
          <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] leading-relaxed">
            SajiloTools displays advertisements provided by Google AdSense and may contain links to external third-party websites. SajiloTools has no control over the content, privacy practices, or accuracy of third-party advertisements or websites. Interaction with third-party advertisers is solely between you and the respective advertiser.
          </p>
        </div>

        {/* Contact CTA */}
        <div className="p-6 bg-[#FAFAF8] dark:bg-[#1E2338]/60 border border-[#E4E0D8] dark:border-[#2A2F48] rounded-2xl text-center space-y-3">
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-[#A1A1AA]">
            Have questions regarding our terms or notice a mathematical discrepancy?
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold">
            <Link href="/contact" className="text-[#1F2544] dark:text-[#F5A623] hover:underline">
              Contact Support &rarr;
            </Link>
            <Link href="/privacy-policy" className="text-[#71717A] dark:text-[#A1A1AA] hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[#71717A] dark:text-[#A1A1AA] hover:underline">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
