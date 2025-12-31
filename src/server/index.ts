import { serve } from "bun";
import index from "../client/index.html";
import { Elysia } from "elysia";

import { filesRoutes } from "./routes/files";
import { foldersRoutes } from "./routes/folders";

const api = new Elysia()
  .get("/api/hello", () => ({
    message: "Hello, world!",
    method: "GET",
  }))
  .use(filesRoutes)
  .use(foldersRoutes);

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes (SPA support)
    "/*": index,

    // API routes
    "/api/*": api.handle,
   
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
