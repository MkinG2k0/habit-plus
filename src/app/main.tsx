import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { initCapacitorEdgeToEdgeChrome } from "@/shared/lib/capacitorSystemBars";
import "@fontsource/roboto-condensed/latin-400.css";
import "@fontsource/roboto-condensed/latin-500.css";
import "@fontsource/roboto-condensed/latin-600.css";
import "@fontsource/roboto-condensed/latin-700.css";
import "@fontsource/roboto-condensed/cyrillic-400.css";
import "@fontsource/roboto-condensed/cyrillic-500.css";
import "@fontsource/roboto-condensed/cyrillic-600.css";
import "@fontsource/roboto-condensed/cyrillic-700.css";
import "@fontsource/roboto-condensed/cyrillic-ext-400.css";
import "@fontsource/roboto-condensed/cyrillic-ext-500.css";
import "@fontsource/roboto-condensed/cyrillic-ext-600.css";
import "@fontsource/roboto-condensed/cyrillic-ext-700.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/dm-sans/latin-ext-400.css";
import "@fontsource/dm-sans/latin-ext-500.css";
import "@fontsource/dm-sans/latin-ext-600.css";
import "@fontsource/dm-sans/latin-ext-700.css";
import "@fontsource/dm-mono/latin-400.css";
import "@fontsource/dm-mono/latin-500.css";
import "@fontsource/dm-mono/latin-ext-400.css";
import "@fontsource/dm-mono/latin-ext-500.css";
import "./styles/index.css";
import { ThemeProvider } from "./providers/theme";
import { AndroidBackNavigation } from "./providers/AndroidBackNavigation";
import { AppContent } from "./AppContent.tsx";

initCapacitorEdgeToEdgeChrome();

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <ThemeProvider>
    <BrowserRouter>
      <AndroidBackNavigation />
      <AppContent />
    </BrowserRouter>
  </ThemeProvider>,
);
