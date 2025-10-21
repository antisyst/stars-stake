import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: '/',
  plugins: [
    react(),
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
  publicDir: './public',
  server: {
    host: '192.168.0.104', 
    port: 5173, 
    https: undefined,
    hmr: {
      host: 'https://accurately-define-inspector-paul.trycloudflare.com',
      protocol: 'wss',
      clientPort: 443,
    },
  },
})