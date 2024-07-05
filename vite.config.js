// vite.config.js
import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import inject from "@rollup/plugin-inject"

export default defineConfig({
  base: '/parking-mapper',
  plugins: [
    inject({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    basicSsl({
      name: 'test',
    })
  ]
})