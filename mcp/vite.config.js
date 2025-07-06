import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'index.js'),
      name: 'FiloDataBroker',
      fileName: 'bundle',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [
        '@modelcontextprotocol/sdk',
        '@lit-protocol/auth-helpers',
        '@lit-protocol/constants',
        '@lit-protocol/encryption',
        '@lit-protocol/lit-node-client-nodejs',
        'ethers',
        'alasql',
        'csv-parse',
        'dotenv',
        'stream-transform',
        'zod',
      ],
    },
    // target: 'node18',
    minify: 'esbuild',
    esbuild: {
      legalComments: 'none',
    },
    // sourcemap: true,
  },
  // define: {
  //   'process.env.NODE_ENV': '"production"',
  // },
  // resolve: {
  //   alias: {
  //     '@': resolve(__dirname, 'lib'),
  //   },
  // },
});
