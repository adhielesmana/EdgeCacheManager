import fs from 'fs/promises';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(exec);

// We assume /etc/nginx is mounted to /host/etc/nginx in the Docker container
const NGINX_SITES_AVAILABLE = '/host/etc/nginx/sites-available';
const NGINX_SITES_ENABLED = '/host/etc/nginx/sites-enabled';

/**
 * Executes a command on the host machine using nsenter.
 * Requires `pid: host` and `privileged: true` in docker-compose.
 */
async function execOnHost(command: string) {
  const cmd = `nsenter -t 1 -m -u -n -i -- ${command}`;
  try {
    const { stdout, stderr } = await execAsync(cmd);
    return { stdout, stderr };
  } catch (error) {
    console.error(`Host execution failed: ${command}`, error);
    throw error;
  }
}

interface DomainConfig {
  name: string;
  sslEnabled: boolean;
  cacheEnabled: boolean;
  cacheTtl: number;
}

interface OriginConfig {
  address: string;
  port: number;
  weight: number;
  protocol?: string | null;
}

export async function generateNginxConfig(domain: DomainConfig, origins: OriginConfig[]) {
  const safeName = domain.name.replace(/[^a-zA-Z0-9.-]/g, '');
  const configPath = path.join(NGINX_SITES_AVAILABLE, `nexuscdn_${safeName}.conf`);
  const enabledPath = path.join(NGINX_SITES_ENABLED, `nexuscdn_${safeName}.conf`);
  
  // Create upstream block
  const upstreamName = `backend_${safeName.replace(/\./g, '_')}`;
  
  let upstreams = '';
  if (origins && origins.length > 0) {
    upstreams = origins.map(o => `    server ${o.address}:${o.port} weight=${o.weight || 1};`).join('\n');
  } else {
    // Fallback if no origins
    upstreams = '    server 127.0.0.1:65535 down;';
  }
  
  let config = `
upstream ${upstreamName} {
${upstreams}
}

server {
    listen 80;
    server_name ${safeName};

    location / {
        proxy_pass http://${upstreamName};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
`;

  if (domain.cacheEnabled) {
      config += `
        proxy_cache nexuscdn;
        proxy_cache_valid 200 302 ${domain.cacheTtl}s;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
        add_header X-Cache-Status $upstream_cache_status;
`;
  }

  config += `
    }
}
`;

  // Ensure directories exist (in case running locally without them)
  try { await fs.mkdir(NGINX_SITES_AVAILABLE, { recursive: true }); } catch (e) {}
  try { await fs.mkdir(NGINX_SITES_ENABLED, { recursive: true }); } catch (e) {}

  await fs.writeFile(configPath, config, 'utf-8');
  
  // Symlink to sites-enabled
  try {
    await fs.symlink(configPath, enabledPath);
  } catch(e: any) {
    if (e.code !== 'EEXIST') throw e;
  }
}

export async function reloadNginx() {
  await execOnHost('systemctl reload nginx');
}

export async function provisionSsl(domainName: string, email: string) {
  // Using certbot to automatically configure SSL for the newly created domain block
  await execOnHost(`certbot --nginx -d ${domainName} -m ${email} --agree-tos --non-interactive --redirect`);
}

export async function removeNginxConfig(domainName: string) {
  const safeName = domainName.replace(/[^a-zA-Z0-9.-]/g, '');
  const configPath = path.join(NGINX_SITES_AVAILABLE, `nexuscdn_${safeName}.conf`);
  const enabledPath = path.join(NGINX_SITES_ENABLED, `nexuscdn_${safeName}.conf`);
  
  try { await fs.unlink(enabledPath); } catch(e) {}
  try { await fs.unlink(configPath); } catch(e) {}
}

export async function purgeNginxCache() {
  // Purging cache directory logic
  // Nginx relies on standard proxy_cache paths. By default or if we specified `proxy_cache_path /var/cache/nginx/nexuscdn`, we'd delete its contents.
  // Using a blanket wipe and reload for all cache via host execution:
  await execOnHost('rm -rf /var/cache/nginx/* && systemctl reload nginx');
}
