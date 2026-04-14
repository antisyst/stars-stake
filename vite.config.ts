import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';
import svgr from "vite-plugin-svgr";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        process: true,
      },
    }),
    svgr({
      svgrOptions: {
        // ...
      },

      esbuildOptions: {
        // ...
      },

      include: "**/*.svg?react",

      exclude: "",
    }),
    tsconfigPaths(),
    mkcert(),
  ],
  ssr: {
    noExternal: [
      '@telegram-apps/toolkit',
      '@telegram-apps/sdk',
      '@telegram-apps/sdk-react',
      '@telegram-apps/telegram-ui',
    ],
  },
  publicDir: './public',
  server: {
    host: '192.168.0.108', 
    port: 5173, 
    https: undefined,
    hmr: {
      host: 'https://skiing-respondents-watson-resource.trycloudflare.com',
      protocol: 'wss',
      clientPort: 443,
    },
  },
})