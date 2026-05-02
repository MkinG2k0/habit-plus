import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { initCapacitorEdgeToEdgeChrome } from "@/shared/lib/capacitorSystemBars";
import "./styles/index.css";
import { registerServiceWorker } from "./providers/pwa/register.ts";
import { ThemeProvider } from "./providers/theme";
import { AndroidBackNavigation } from "./providers/AndroidBackNavigation";
import { AppContent } from "./AppContent.tsx";

initCapacitorEdgeToEdgeChrome();
registerServiceWorker();

const rootElement = document.getElementById("root")!;

void (async () => {
  createRoot(rootElement).render(
    <ThemeProvider>
      <BrowserRouter>
        <AndroidBackNavigation />
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>,
  );
})();
