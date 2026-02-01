import type { Metadata } from "next";
import Composer from "@/components/dashboard/Composer";

export const metadata: Metadata = {
  title: "Composer — Eva Paradis Content Engine",
  robots: { index: false, follow: false },
};

export default function ComposePage() {
  return <Composer />;
}
