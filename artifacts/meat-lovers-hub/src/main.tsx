import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

// Configure API base URL from Vite env. Leave null to use relative paths.
const apiBase = (import.meta.env.VITE_API_BASE as string) ?? null;
setBaseUrl(apiBase || null);

createRoot(document.getElementById("root")!).render(<App />);
