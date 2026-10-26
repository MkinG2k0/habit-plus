/// <reference types="@capacitor/local-notifications" />
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.habit.myapp",
  appName: "Habiday - трекер привычек",
  webDir: "dist",
  plugins: {
    LocalNotifications: {
      iconColor: "#22c55e",
      presentationOptions: ["badge", "sound", "banner", "list"],
    },
  },
  // server: {
  //   url: "http://192.168.0.199:5173",
  //   cleartext: true,
  // },
};

export default config;
