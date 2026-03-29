import app from "./app";
import { logger } from "./lib/logger";
import { seedSuperAdmin } from "./lib/seed";
import { startLogTailer } from "./lib/logParser";
import { startHealthChecker } from "./lib/healthCheck";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  await seedSuperAdmin();
  
  // Start the Nginx live stats parser daemon
  startLogTailer();
  
  // Start the Active Origin Health Checker
  startHealthChecker();
});
