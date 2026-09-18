import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { error } from "console";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IT Document Management",
  description: "A Web-App for the IT Department",
};

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-input-bg">{children}</main>
      </div>
    </div>
  );
}
