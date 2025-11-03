import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "scary-story-generator",
  brand: {
    displayName: "scary-story-generator", // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: "#3182F6", // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "https://storage.googleapis.com/scary-story-generator/scary-story-generator-logo.png", // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
    bridgeColorMode: "basic",
  },
  web: {
    host: "192.168.0.14",
    port: 5173,
    commands: {
      dev: "vite --host",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
