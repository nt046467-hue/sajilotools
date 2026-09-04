import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen print:min-h-0 bg-[#F7F5F0] dark:bg-[#0C0F1E] print:bg-white">
      <SiteHeader />
      <main className="print:m-0 print:p-0">{children}</main>
      <SiteFooter />
    </div>
  );
}

