import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import seoStaticRouter from "./routes/seo-static";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// Configure CORS origins via environment variable `CORS_ORIGINS` (comma-separated).
// If not set, defaults to allowing all origins (same behaviour as before).
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
  : undefined;

app.use(cors({ origin: allowedOrigins ?? true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(seoStaticRouter);
app.use("/api", router);

export default app;
