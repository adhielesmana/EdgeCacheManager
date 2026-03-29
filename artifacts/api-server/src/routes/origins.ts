import { Router, type IRouter } from "express";
import { db, originsTable, domainsTable } from "@workspace/db";
import { CreateOriginBody, UpdateOriginBody } from "@workspace/api-zod";
import { eq, and } from "drizzle-orm";
import { generateNginxConfig, reloadNginx } from "../lib/nginx";

const router: IRouter = Router();

router.get("/domains/:domainId/origins", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const domainId = parseInt(req.params.domainId);
  if (isNaN(domainId)) {
    res.status(400).json({ error: "Invalid domain ID" });
    return;
  }

  const origins = await db.select().from(originsTable).where(eq(originsTable.domainId, domainId));
  res.json(origins);
});

router.post("/domains/:domainId/origins", async (req, res) => {
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

  const parsed = CreateOriginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const [origin] = await db
    .insert(originsTable)
    .values({
      domainId,
      address: parsed.data.address,
      port: parsed.data.port ?? 80,
      protocol: parsed.data.protocol ?? "http",
      weight: parsed.data.weight ?? 100,
    })
    .returning();

  const allOrigins = await db.select().from(originsTable).where(eq(originsTable.domainId, domainId));
  try {
    await generateNginxConfig(domain, allOrigins);
    await reloadNginx();
  } catch (error) {
    console.error("Failed to apply Nginx config from origin addition:", error);
  }

  res.status(201).json(origin);
});

router.patch("/domains/:domainId/origins/:originId", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role === "user") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const domainId = parseInt(req.params.domainId);
  const originId = parseInt(req.params.originId);
  if (isNaN(domainId) || isNaN(originId)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateOriginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const [updated] = await db
    .update(originsTable)
    .set(parsed.data)
    .where(and(eq(originsTable.id, originId), eq(originsTable.domainId, domainId)))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Origin not found" });
    return;
  }

  const [domain] = await db.select().from(domainsTable).where(eq(domainsTable.id, domainId));
  if (domain) {
    const allOrigins = await db.select().from(originsTable).where(eq(originsTable.domainId, domainId));
    try {
      await generateNginxConfig(domain, allOrigins);
      await reloadNginx();
    } catch (error) {
      console.error("Failed to apply Nginx config from origin update:", error);
    }
  }

  res.json(updated);
});

router.delete("/domains/:domainId/origins/:originId", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role === "user") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const domainId = parseInt(req.params.domainId);
  const originId = parseInt(req.params.originId);
  if (isNaN(domainId) || isNaN(originId)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [deleted] = await db
    .delete(originsTable)
    .where(and(eq(originsTable.id, originId), eq(originsTable.domainId, domainId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Origin not found" });
    return;
  }

  const [domain] = await db.select().from(domainsTable).where(eq(domainsTable.id, domainId));
  if (domain) {
    const allOrigins = await db.select().from(originsTable).where(eq(originsTable.domainId, domainId));
    try {
      await generateNginxConfig(domain, allOrigins);
      await reloadNginx();
    } catch (error) {
      console.error("Failed to apply Nginx config from origin deletion:", error);
    }
  }

  res.status(204).send();
});

export default router;
