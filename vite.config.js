import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages はリポジトリ名のサブフォルダで配信されるため相対パスにする
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        // Firebase SDK は容量が大きく更新も少ないので別ファイルに分け、
        // アプリ側を直したときに再ダウンロードされないようにする
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          react: ["react", "react-dom"],
        },
      },
    },
  },
});
