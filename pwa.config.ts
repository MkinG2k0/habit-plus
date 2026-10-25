import type { ManifestOptions } from "vite-plugin-pwa";

export const pwaManifest: Partial<ManifestOptions> = {
  id: "/",
  name: "habit+",
  short_name: "habit+",
  description: "Трекер привычек — работает офлайн на телефоне",
  lang: "ru",
  dir: "ltr",
  theme_color: "#0d0d0d",
  background_color: "#0d0d0d",
  display: "standalone",
  display_override: ["standalone", "minimal-ui"],
  orientation: "portrait-primary",
  scope: "/",
  start_url: "/",
  categories: ["lifestyle", "health", "productivity"],
  screenshots: [
    {
      src: "/screenshots/narrow-home.png",
      sizes: "540x720",
      type: "image/png",
      form_factor: "narrow",
      label: "Список привычек на сегодня",
    },
    {
      src: "/screenshots/narrow-settings.png",
      sizes: "540x720",
      type: "image/png",
      form_factor: "narrow",
      label: "Настройки и установка",
    },
    {
      src: "/screenshots/wide-home.png",
      sizes: "1280x720",
      type: "image/png",
      form_factor: "wide",
      label: "habit+ на большом экране",
    },
  ],
  icons: [
    {
      src: "/pwa-192x192.png",
      type: "image/png",
      sizes: "192x192",
      purpose: "any",
    },
    {
      src: "/pwa-512x512.png",
      type: "image/png",
      sizes: "512x512",
      purpose: "any",
    },
    {
      src: "/pwa-512x512-maskable.png",
      type: "image/png",
      sizes: "512x512",
      purpose: "maskable",
    },
  ],
  shortcuts: [
    {
      name: "Сегодня",
      description: "Открыть привычки на сегодня",
      url: "/",
      icons: [
        {
          src: "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
    },
    {
      name: "Настройки",
      description: "Тема, бэкап и установка",
      url: "/settings",
      icons: [
        {
          src: "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
    },
  ],
};
