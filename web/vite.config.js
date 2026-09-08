// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Keep Vite's project root inside the web folder
  root: ".",

  // Prevent Vite from searching outside the web project
  server: {
    fs: {
      allow: ["."],
    },
  },
});
