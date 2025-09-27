import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tsconfigPaths(),
    mkcert(),
  ],
  publicDir: './public',
  server: {
    host: '172.20.10.9', 
    port: 5173, 
    https: undefined,
    proxy: {
      '/gift': {
        target: 'https://nft.fragment.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/gift/, '/gift'),
      },
    }
  },
});