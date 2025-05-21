// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from 'vite-plugin-node-polyfills'; // 1. Import the plugin
// import { componentTagger } from "lovable-tagger"; // Your existing import

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // mode === 'development' && componentTagger(), // Your existing plugin
    nodePolyfills({ // 2. Add the plugin to the plugins array
      // To exclude specific polyfills, add them to this list.
      // For example, if you don't want to polyfill `fs`:
      // exclude: ['fs'],
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // No need to alias 'events' manually here if using vite-plugin-node-polyfills for 'events'
    },
  },
  optimizeDeps: {
    // It's good practice to include dependencies that cause issues here,
    // though the polyfill plugin might handle what's needed for 'events'.
    include: ['html-to-docx', 'xmlbuilder2'],
  }
}));