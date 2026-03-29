import { Router, type IRouter } from "express";
import { db, requestStatsTable, domainsTable, originsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [domainCount] = await db.select({ count: sql<number>`count(*)::int` }).from(domainsTable);
  const [originCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(originsTable)
    .where(eq(originsTable.isActive, true));

  const statsRows = await db.select().from(requestStatsTable);

  const totalRequests = statsRows.reduce((sum, s) => sum + s.requests, 0);
  const cacheHits = statsRows.reduce((sum, s) => sum + s.cacheHits, 0);
  const cacheMisses = statsRows.reduce((sum, s) => sum + s.cacheMisses, 0);
  const totalBandwidth = statsRows.reduce((sum, s) => sum + s.bandwidth, 0);
  const cacheHitRate = totalRequests > 0 ? cacheHits / totalRequests : 0;

  res.json({
    totalDomains: domainCount?.count ?? 0,
    totalRequests,
    cacheHits,
    cacheMisses,
    cacheHitRate,
    totalBandwidth,
    activeOrigins: originCount?.count ?? 0,
  });
});

router.get("/domains/:domainId/stats", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
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

  const [stats] = await db
    .select()
    .from(requestStatsTable)
    .where(eq(requestStatsTable.domainId, domainId));

  if (!stats) {
    res.json({
      domainId,
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      bandwidth: 0,
      cachedFiles: 0,
      cacheSize: 0,
    });
    return;
  }

  const cacheHitRate = stats.requests > 0 ? stats.cacheHits / stats.requests : 0;

  res.json({
    domainId,
    requests: stats.requests,
    cacheHits: stats.cacheHits,
    cacheMisses: stats.cacheMisses,
    cacheHitRate,
    bandwidth: stats.bandwidth,
    cachedFiles: stats.cachedFiles,
    cacheSize: stats.cacheSize,
  });
});

export default router;
