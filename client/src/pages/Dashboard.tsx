import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import DashboardContent from "@/components/DashboardContent";

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    // Simple password protection - in production, use proper auth
    if (password === "eva2026") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border-white/10">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">Eva Dashboard</h1>
              <p className="text-white/60 text-sm">Operational Control Surface</p>
            </div>
            <div className="w-full space-y-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <Button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
              >
                Access Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return <DashboardContent />;
}
