import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";

createRoot(document.getElementById("root")!).render(
  <TDSMobileAITProvider>
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  </TDSMobileAITProvider>
);
