FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies with architecture-specific flags to avoid rollup issues
RUN npm install --no-optional --legacy-peer-deps

COPY . .

# Create a custom vite config that doesn't use native Node.js modules
RUN echo 'import { defineConfig } from "vite";\
import react from "@vitejs/plugin-react";\
\
export default defineConfig({\
  plugins: [react()],\
  server: {\
    port: 3000,\
    host: "0.0.0.0",\
    proxy: {\
      "/api": {\
        target: "http://server:8000",\
        changeOrigin: true,\
        secure: false\
      }\
    }\
  },\
  optimizeDeps: {\
    esbuildOptions: {\
      define: {\
        global: "globalThis"\
      }\
    }\
  },\
  build: {\
    commonjsOptions: {\
      transformMixedEsModules: true\
    }\
  }\
});' > vite.docker.js

EXPOSE 3000

# Use the custom vite config
CMD ["npm", "exec", "--", "vite", "--config", "vite.docker.js", "--host"] 