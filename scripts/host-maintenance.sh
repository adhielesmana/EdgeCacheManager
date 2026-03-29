#!/bin/bash
# Host-level maintenance setup script: configures logrotate and certbot autorenewal
# Run this on the host machine, NOT inside Docker.

echo "Setting up Let's Encrypt Certbot SSL Renewal..."
if command -v certbot > /dev/null; then
  # Create a daily cron job for certbot renewal if it doesn't exist
  if ! grep -q "certbot renew" /etc/crontab; then
    echo "0 0 * * * root certbot renew --quiet --nginx" >> /etc/crontab
    echo "Added certbot renewal cron job."
  else
    echo "Certbot renewal already configured."
  fi
else
  echo "Certbot not found. Please install certbot."
fi

echo "Setting up Nginx logrotate..."
cat > /etc/logrotate.d/nexuscdn << 'EOF'
/var/log/nginx/nexuscdn_*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF

echo "Logrotate configuration saved to /etc/logrotate.d/nexuscdn"
echo "Host maintenance setup complete!"
