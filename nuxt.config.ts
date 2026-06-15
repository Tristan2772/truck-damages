import tailwindcss from "@tailwindcss/vite";
import { env } from "node:process";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "alternate icon", href: "/favicon.ico" },
      ],
    },
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  debug: true,

  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxtjs/color-mode",
    "@pinia/nuxt",
    "@vee-validate/nuxt",
    "nuxt-csurf",
    "nuxt-easy-lightbox",
    "@sentry/nuxt/module",
  ],

  colorMode: {
    preference: "system",
    fallback: "light",
  },

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      s3BucketUrl: env.S3_BUCKET_URL,
    },
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  vite: {
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "betterauth/vue",
      ],
    },
    plugins: [
      tailwindcss(),
    ],
  },

  sentry: {
    org: import.meta.env.SENTRY_ORG,
    project: import.meta.env.SENTRY_PROJECT,
    autoInjectServerSentry: "top-level-import",
  },

  sourcemap: {
    client: "hidden",
  },
});
