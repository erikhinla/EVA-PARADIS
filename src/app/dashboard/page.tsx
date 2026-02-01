import type { Metadata } from "next";
import Dashboard from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Command Center — Eva Paradis Content Engine",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <Dashboard />;
}
