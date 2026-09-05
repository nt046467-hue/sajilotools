import Link from "next/link";
import Logo from "@/components/shared/Logo";
import { Heart } from "lucide-react";
import AdUnit from "@/components/AdUnit";
import CookiePreferencesButton from "@/components/layout/CookiePreferencesButton";

const NAV_LINKS = [
  { name: "PDF Tools", href: "/tools/pdf" },
  { name: "Text Tools", href: "/tools/text" },
  { name: "Image Tools", href: "/tools/image" },
  { name: "Finance Tools", href: "/tools/finance" },
  { name: "Developer Tools", href: "/tools/developer" },
  { name: "Nepal Tools", href: "/tools/nepal" },
  { name: "Everyday Tools", href: "/tools/everyday" },
];

export default function SiteFooter() {
  return (
    <footer className="print:hidden border-t border-border bg-background/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Footer Banner Ad Slot (collapses to 0 height when unfilled) */}
        <AdUnit
          slot={process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT || "auto"}
          placement="footer"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Link href="/">
                <Logo size={28} />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Easy tools, made local. Built with love for Nepal and the world.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] inline-block animate-pulse" />
              All systems operational
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4
              className="font-semibold text-foreground text-sm mb-4 font-sora"
            >
              Tools
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.name}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4
              className="font-semibold text-foreground text-sm mb-4 font-sora"
            >
              Company
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: "About Us", href: "/about" },
                { name: "Contact", href: "/contact" },
                { name: "Guides & Articles", href: "/blog" },
                { name: "All Tools", href: "/tools" },
              ].map((l) => (
                <li key={l.name}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              className="font-semibold text-foreground text-sm mb-4 font-sora"
            >
              Legal
            </h4>
            <ul className="space-y-2.5">
              {[
                { name: "Privacy Policy", href: "/privacy-policy" },
                { name: "Terms of Use", href: "/terms" },
                { name: "Disclaimer", href: "/disclaimer" },
                { name: "Contact Support", href: "/contact" },
              ].map((l) => (
                <li key={l.name}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
              <li>
                <CookiePreferencesButton />
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            © 2026 SajiloTools. Made with
            <Heart
              size={11}
              strokeWidth={2}
              className="text-rose-400 fill-rose-400 inline"
            />
            in Nepal.
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">सजिलो</span> — Easy tools, made local.
          </p>
        </div>
      </div>
    </footer>
  );
}
