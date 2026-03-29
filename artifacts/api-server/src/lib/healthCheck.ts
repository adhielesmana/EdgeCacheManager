import { db, originsTable, domainsTable } from '@workspace/db';
import { eq, and } from 'drizzle-orm';
import { updateDomainNginxConfig } from './nginxHelper'; // Assuming we extract logic to a helper or just re-import generateNginxConfig and reloadNginx
import { generateNginxConfig, reloadNginx } from './nginx';

export function startHealthChecker() {
  console.log("Starting active origin health checker...");
  setInterval(checkOrigins, 30_000); // Check every 30 seconds
}

async function checkOrigins() {
  try {
    const domains = await db.select().from(domainsTable);
    for (const domain of domains) {
      const origins = await db.select().from(originsTable).where(eq(originsTable.domainId, domain.id));
      let changed = false;

      for (const origin of origins) {
        let isHealthy = true;
        try {
          // Simple fetch to the origin address
          const protocol = origin.protocol || 'http';
          // Ensure we don't block indefinitely
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const res = await fetch(`${protocol}://${origin.address}:${origin.port}/`, {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (res.status >= 500) {
            isHealthy = false;
          }
        } catch (e) {
          isHealthy = false; // network error, timeout etc.
        }

        if (origin.isActive !== isHealthy) {
          changed = true;
          await db.update(originsTable).set({ isActive: isHealthy }).where(eq(originsTable.id, origin.id));
        }
      }

      if (changed) {
        // Find only active ones to write to nginx config
        const activeOrigins = origins.filter(o => 
          o.isActive !== false || (o.isActive === false && isHealthy === true) // wait, actually we just query again:
        );
        const latestOrigins = await db.select().from(originsTable).where(and(eq(originsTable.domainId, domain.id), eq(originsTable.isActive, true)));
        try {
          await generateNginxConfig(domain, latestOrigins);
          await reloadNginx();
        } catch (err) {
          console.error(`HealthCheck reload failure: ${err}`);
        }
      }
    }
  } catch (err) {
    console.error("Health check error", err);
  }
}
