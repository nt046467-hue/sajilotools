import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0C0F1E]">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

