import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Accept connections from all IP addresses and hostnames
    port: 5173, // Ensure the server listens on port 5173
  },
});
