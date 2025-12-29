import { serve } from "bun";
import index from "../client/index.html";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes (SPA support)
    "/*": index,

    // API routes
    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
    },
    "/api/queries": {
      async GET(req) {
        try {
          const { readdir } = await import("node:fs/promises");
          const files = await readdir("queries");
          // Filter for sql/cypher files if needed, or just return all
          return Response.json(files.filter(f => !f.startsWith(".")));
        } catch (error) {
           // if dir doesn't exist, return empty
           return Response.json([]);
        }
      },
    },
    "/api/query": {
      async GET(req) {
        const url = new URL(req.url);
        const filename = url.searchParams.get("file");
        if (!filename) return new Response("Missing file param", { status: 400 });
        
        try {
             const file = Bun.file(`queries/${filename}`);
             if (await file.exists()) {
                 const content = await file.text();
                 return Response.json({ content, filename });
             }
             return new Response("File not found", { status: 404 });
        } catch(e) {
            return new Response("Error reading file", { status: 500 });
        }
      }
    }
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
