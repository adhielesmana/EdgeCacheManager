import { db, originsTable, domainsTable } from '@workspace/db';
import { eq, and } from 'drizzle-orm';
import { generateNginxConfig, reloadNginx } from './nginx';

export function startHealthChecker() {
  console.log('Starting active origin health checker...');
  setInterval(checkOrigins, 30_000);
}

async function checkOrigins() {
  try {
    const domains = await db.select().from(domainsTable);

    for (const domain of domains) {
      const origins = await db
        .select()
        .from(originsTable)
        .where(eq(originsTable.domainId, domain.id));
      let changed = false;

      for (const origin of origins) {
        const healthy = await probeOrigin(origin);
        if (origin.isActive !== healthy) {
          changed = true;
          await db
            .update(originsTable)
            .set({ isActive: healthy })
            .where(eq(originsTable.id, origin.id));
        }
      }

      if (changed) {
        const latestOrigins = await db
          .select()
          .from(originsTable)
          .where(and(eq(originsTable.domainId, domain.id), eq(originsTable.isActive, true)));

        try {
          await generateNginxConfig(domain, latestOrigins);
          await reloadNginx();
        } catch (err) {
          console.error(`HealthCheck reload failure: ${err}`);
        }
      }
    }
  } catch (err) {
    console.error('Health check error', err);
  }
}

async function probeOrigin(origin: { address: string; port: number; protocol?: string | null }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const protocol = origin.protocol || 'http';
    const response = await fetch(`${protocol}://${origin.address}:${origin.port}/`, {
      signal: controller.signal,
    });
    return response.status < 500;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
