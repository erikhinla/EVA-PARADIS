import AccessPageClient from "./AccessPageClient";
import { ACCESS_HUB_DEFAULT_ROWS } from "@/lib/accessHub";

export const metadata = {
  title: "Eva Paradis — Access & Control Hub",
  robots: { index: false, follow: false },
};

export default function AccessControlHub() {
  return <AccessPageClient initialRows={ACCESS_HUB_DEFAULT_ROWS} />;
}
