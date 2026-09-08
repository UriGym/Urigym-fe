import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.urigym.app',
  appName: 'UriGym',
  webDir: 'dist',
  // Loads the live site directly instead of a bundled copy — VITE_API_URL is a relative
  // "/api" path (see .env.production), which only resolves correctly against this origin.
  server: {
    url: 'https://urigym.co.kr',
  },
};

export default config;
