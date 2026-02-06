
import express, { type Request, Response, NextFunction } from "express";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { serveStatic } from "./static";
import { createServer } from "http";
import { createServer } from "http";
import { seedDatabase } from "./seed";
import { seedDatabase } from "./seed";


const app = express();
const httpServer = createServer(app);

declare module "http" {
declare module "http" {
  interface IncomingMessage {
  interface IncomingMessage {
    rawBody: unknown;
    rawBody: unknown;
  }
  }
}
}


app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    hour: "numeric",
    minute: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    second: "2-digit",
    hour12: true,
    hour12: true,
  });
  });


  console.log(`${formattedTime} [${source}] ${message}`);
  console.log(`${formattedTime} [${source}] ${message}`);
}
}


app.use((req, res, next) => {
export async function createApp() {
  const start = Date.now();
  const app = express();
  const path = req.path;
  const httpServer = createServer(app);
  let capturedJsonResponse: Record<string, any> | undefined = undefined;


  app.use(
  const originalResJson = res.json;
    express.json({
  res.json = function (bodyJson, ...args) {
      verify: (req, _res, buf) => {
    capturedJsonResponse = bodyJson;
        req.rawBody = buf;
    return originalResJson.apply(res, [bodyJson, ...args]);
      },
  };
    }),

  );
  res.on("finish", () => {

    const duration = Date.now() - start;
  app.use(express.urlencoded({ extended: false }));
    if (path.startsWith("/api")) {

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
  app.use((req, res, next) => {
      if (capturedJsonResponse) {
    const start = Date.now();
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        log(logLine);
      }
      }
    });


      log(logLine);
    next();
    }
  });
  });


  next();
});

(async () => {
  try {
  try {
    await seedDatabase();
    await seedDatabase();
  } catch (error) {
  } catch (error) {
    console.error("Failed to seed database:", error);
    console.error("Failed to seed database:", error);
  }
  }
  await registerRoutes(httpServer, app);
  await registerRoutes(httpServer, app);


  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const message = err.message || "Internal Server Error";


    console.error("Internal Server Error:", err);
    console.error("Internal Server Error:", err);


    if (res.headersSent) {
    if (res.headersSent) {
      return next(err);
      return next(err);
    }
    }


    return res.status(status).json({ message });
    return res.status(status).json({ message });
  });
  });


  // importantly only setup vite in development and after
  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
  if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
    serveStatic(app);
    serveStatic(app);
  } else {
  } else {
    const { setupVite } = await import("./vite");
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
    await setupVite(httpServer, app);
  }
  }


  return { app, httpServer };
}

async function startServer() {
  const { httpServer } = await createApp();

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
  httpServer.listen(
    {
    {
      port,
      port,
      host: "0.0.0.0",
      host: "0.0.0.0",
      reusePort: true,
      reusePort: true,
    },
    },
    () => {
    () => {
      log(`serving on port ${port}`);
      log(`serving on port ${port}`);
    },
    },
  );
  );
})();
}

if (!process.env.VERCEL) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}
