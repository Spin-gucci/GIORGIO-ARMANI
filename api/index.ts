import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "../server/index";

const appPromise = createApp();

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const { app } = await appPromise;
  return app(req, res);
}
client/index.html
client/index.html
