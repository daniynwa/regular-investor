// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://regular-investor.com',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // Disable Astro's built-in CSRF check — our session cookie already
  // authenticates every API request. The default check blocks DELETE/PUT
  // requests when the admin accesses the panel via an IP address.
  security: {
    checkOrigin: false,
  },
  vite: {
    plugins: [tailwindcss()],
    envPrefix: ['PUBLIC_', 'DB_', 'ADMIN_'],
  },
});
