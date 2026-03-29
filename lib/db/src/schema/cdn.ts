import { pgTable, text, integer, boolean, timestamp, serial, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const domainsTable = pgTable("domains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  sslEnabled: boolean("ssl_enabled").notNull().default(false),
  cacheEnabled: boolean("cache_enabled").notNull().default(true),
  cacheTtl: integer("cache_ttl").notNull().default(3600),
  status: text("status", { enum: ["active", "inactive", "provisioning"] }).notNull().default("provisioning"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDomainSchema = createInsertSchema(domainsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domainsTable.$inferSelect;

export const originsTable = pgTable("origins", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domainsTable.id, { onDelete: "cascade" }),
  address: text("address").notNull(),
  port: integer("port").notNull().default(80),
  protocol: text("protocol", { enum: ["http", "https"] }).notNull().default("http"),
  weight: integer("weight").notNull().default(100),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("origins_domain_idx").on(t.domainId)]);

export const insertOriginSchema = createInsertSchema(originsTable).omit({ id: true, createdAt: true });
export type InsertOrigin = z.infer<typeof insertOriginSchema>;
export type Origin = typeof originsTable.$inferSelect;

export const requestStatsTable = pgTable("request_stats", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domainsTable.id, { onDelete: "cascade" }),
  requests: integer("requests").notNull().default(0),
  cacheHits: integer("cache_hits").notNull().default(0),
  cacheMisses: integer("cache_misses").notNull().default(0),
  bandwidth: integer("bandwidth").notNull().default(0),
  cachedFiles: integer("cached_files").notNull().default(0),
  cacheSize: integer("cache_size").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("stats_domain_idx").on(t.domainId)]);

export type RequestStats = typeof requestStatsTable.$inferSelect;
