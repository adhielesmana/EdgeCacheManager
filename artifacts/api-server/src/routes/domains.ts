import { Router, type IRouter } from "express";
import { db, domainsTable, originsTable, requestStatsTable } from "@workspace/db";
import { CreateDomainBody, UpdateDomainBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { generateNginxConfig, removeNginxConfig, reloadNginx, provisionSsl } from "../lib/nginx";

const router: IRouter = Router();

router.get("/domains", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const domains = await db.select().from(domainsTable).orderBy(domainsTable.createdAt);
  res.json(domains);
});

router.post("/domains", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role === "user") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = CreateDomainBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const [domain] = await db
    .insert(domainsTable)
    .values({
      name: parsed.data.name,
      sslEnabled: parsed.data.sslEnabled ?? false,
      cacheEnabled: parsed.data.cacheEnabled ?? true,
      cacheTtl: parsed.data.cacheTtl ?? 3600,
    })
    .returning();

  await db.insert(requestStatsTable).values({ domainId: domain.id });

  try {
    await generateNginxConfig(domain, []);
    await reloadNginx();
    if (domain.sslEnabled) {
      // Typically need a working user email inside `.env` or from user profile
      const email = process.env.CERTBOT_EMAIL || "admin@example.com";
      await provisionSsl(domain.name, email);
    }
  } catch (error) {
    console.error("Failed to apply Nginx config or SSL:", error);
  }

  res.status(201).json(domain);
});

router.get("/domains/:domainId", async (req, res) => {
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

  const origins = await db.select().from(originsTable).where(eq(originsTable.domainId, domainId));

  res.json({ ...domain, origins });
});

router.patch("/domains/:domainId", async (req, res) => {
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

  const parsed = UpdateDomainBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const [updated] = await db
    .update(domainsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(domainsTable.id, domainId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Domain not found" });
    return;
  }

  const origins = await db.select().from(originsTable).where(eq(originsTable.domainId, domainId));
  try {
    await generateNginxConfig(updated, origins);
    await reloadNginx();
    if (updated.sslEnabled && !parsed.data.sslEnabled /* meaning it was just enabled */) {
      // Actually we should provision SSL if it is true, certbot is idempotent 
      const email = process.env.CERTBOT_EMAIL || "admin@example.com";
      await provisionSsl(updated.name, email);
    }
  } catch (error) {
    console.error("Failed to apply Nginx config or SSL:", error);
  }

  res.json(updated);
});

router.delete("/domains/:domainId", async (req, res) => {
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

  const [deleted] = await db
    .delete(domainsTable)
    .where(eq(domainsTable.id, domainId))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Domain not found" });
    return;
  }

  try {
    await removeNginxConfig(deleted.name);
    await reloadNginx();
  } catch (error) {
    console.error("Failed to remove Nginx config:", error);
  }

  res.status(204).send();
});

export default router;
