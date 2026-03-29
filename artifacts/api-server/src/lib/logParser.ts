import { spawn } from 'child_process';
import { db, requestStatsTable, domainsTable } from '@workspace/db';
import { eq, sql } from 'drizzle-orm';

const LOG_FILE = '/host/var/log/nginx/nexuscdn_access.log';

export function startLogTailer() {
  console.log(`Starting log tailer on ${LOG_FILE}...`);
  // using tail -F to follow the log file even if it's rotated
  const tail = spawn('nsenter', ['-t', '1', '-m', '-u', '-n', '-i', '--', 'tail', '-F', '/var/log/nginx/nexuscdn_access.log']);

  tail.stdout.on('data', async (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    for (const line of lines) {
      await processLogLine(line);
    }
  });

  tail.stderr.on('data', (data) => {
    console.error(`Log Tailer Error: ${data}`);
  });

  tail.on('close', (code) => {
    console.log(`Log Tailer exited with code ${code}. Restarting...`);
    setTimeout(startLogTailer, 5000);
  });
}

// Very basic combined log format parser
// 127.0.0.1 - - [29/Mar/2026:10:00:00 +0000] "GET / HTTP/1.1" 200 512 "-" "User-Agent"
async function processLogLine(line: string) {
  try {
    // A more robust regex is normally used here
    const parts = line.match(/^(\S+) \S+ \S+ \[([^\]]+)\] "([A-Z]+) (\S+) [^"]+" (\d{3}) (\d+) "[^"]*" "[^"]*"/);
    if (!parts) return;

    const [_, ip, timestamp, method, path, status, bytesStr] = parts;
    const bytes = parseInt(bytesStr, 10);
    
    // Naively assume the host is available via some parsing or we just log global stats for MVP
    // For a real CDN, the log format should be upgraded to JSON including the $host variable.
    // For now, let's just log globally or to the first domain as a stub.
    const [domain] = await db.select().from(domainsTable).limit(1);
    if (!domain) return;

    // We'd check X-Cache-Status from a custom JSON log normally. Assuming Miss for now unless 304.
    const cacheHit = status === '304' ? 1 : 0;
    const cacheMiss = cacheHit === 0 ? 1 : 0;

    await db.update(requestStatsTable)
      .set({
        requests: sql`${requestStatsTable.requests} + 1`,
        bandwidth: sql`${requestStatsTable.bandwidth} + ${bytes}`,
        cacheHits: sql`${requestStatsTable.cacheHits} + ${cacheHit}`,
        cacheMisses: sql`${requestStatsTable.cacheMisses} + ${cacheMiss}`,
        updatedAt: new Date()
      })
      .where(eq(requestStatsTable.domainId, domain.id));
      
  } catch (err) {
    console.error(`Failed to parse log line: ${err}`);
  }
}
