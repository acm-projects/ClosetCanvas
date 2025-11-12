// app.config.js
import 'dotenv/config';

export default {
  expo: {
    name: "ClosetCanvas",
    slug: "ClosetCanvas",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "closetcanvas",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    extra: {
      OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      package: "com.ClosetCanvas.closetcanvas",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "expo-web-browser",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};
