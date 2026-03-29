import { Router, type IRouter } from "express";
import { db, requestStatsTable, domainsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { purgeNginxCache } from "../lib/nginx";

const router: IRouter = Router();

router.post("/domains/:domainId/cache/purge", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role === "user") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const domainId = parseInt(req.params.domainId);
  if (isNaN(domainId)) {
    res.status(400).json({ error: "Invalid domain ID" });
    return;
  }

  const [domain] = await db.select().from(domainsTable).where(eq(domainsTable.id, domainId));
  if (!domain) {
    res.status(404).json({ error: "Domain not found" });
    return;
  }

  const path = req.body?.path as string | undefined;

  const [stats] = await db.select().from(requestStatsTable).where(eq(requestStatsTable.domainId, domainId));
  const purgedCount = stats ? stats.cachedFiles : 0;

  await db
    .update(requestStatsTable)
    .set({ cachedFiles: 0, cacheSize: 0, updatedAt: new Date() })
    .where(eq(requestStatsTable.domainId, domainId));

  try {
    await purgeNginxCache();
  } catch (err) {
    console.error(`Failed to physically purge host Nginx cache: ${err}`);
  }

  res.json({
    purgedCount,
    message: path
      ? `Purged cache for path: ${path}`
      : `Purged all ${purgedCount} cached files for domain: ${domain.name}`,
  });
});

export default router;
