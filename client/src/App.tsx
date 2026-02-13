import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Analytics } from "@vercel/analytics/react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Out from "./pages/Out";
import Capture from "./pages/Capture";
import Dashboard from "./pages/Dashboard";
import VipPreview from "./pages/VipPreview";
import TelegramOptIn from "./pages/TelegramOptIn";
import EmailCapture from "./pages/EmailCapture";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/out"} component={Out} />
      <Route path={"/capture"} component={Capture} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/vip"} component={VipPreview} />
      <Route path={"/telegram"} component={TelegramOptIn} />
      <Route path={"/email"} component={EmailCapture} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <Analytics />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
