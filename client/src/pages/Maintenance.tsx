import { WrenchIcon } from "lucide-react";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-6 text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
          <WrenchIcon className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">Product Offline</h1>
          <p className="text-white/70 text-base leading-relaxed">
            We&apos;re currently undergoing scheduled maintenance.
            <br />
            The service will be back shortly. Thank you for your patience.
          </p>
        </div>
      </div>
    </div>
  );
}
