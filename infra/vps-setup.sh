#!/usr/bin/env bash
# Idempotent VPS bootstrap. Safe to run multiple times.
# Run on the Contabo box from /root/devutsav after rsync.
set -euo pipefail

REPO_DIR="/root/devutsav"
DOMAIN="devutsav.com"
WWW_DOMAIN="www.devutsav.com"
NGINX_CONF_SRC="${REPO_DIR}/infra/nginx-vps.conf"
NGINX_CONF_DST="/etc/nginx/sites-available/devutsav.conf"
LE_LIVE="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"

echo "==> 1/8 Tearing down Docker stack (if any)…"
if command -v docker >/dev/null 2>&1; then
  if [ -f "${REPO_DIR}/docker-compose.yml" ]; then
    (cd "${REPO_DIR}" && docker compose down --remove-orphans 2>/dev/null || true)
  fi
  docker rm -f $(docker ps -aq) 2>/dev/null || true
  docker rmi -f devutsav-web devutsav-api 2>/dev/null || true
  docker system prune -af --volumes 2>/dev/null || true
fi

echo "==> 2/8 Installing Node 20, pm2, nginx, certbot…"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -dv -f2 | cut -d. -f1)" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
apt-get install -y nginx certbot python3-certbot-nginx rsync build-essential
npm i -g pm2

echo "==> 3/8 Migrating Let's Encrypt certs from Docker volume (if needed)…"
if [ ! -f "${LE_LIVE}" ] && [ -d "${REPO_DIR}/certbot/conf/live/${DOMAIN}" ]; then
  mkdir -p /etc/letsencrypt
  cp -a "${REPO_DIR}/certbot/conf/." /etc/letsencrypt/
  echo "    copied Docker certbot volume into /etc/letsencrypt"
fi

mkdir -p /var/www/certbot /var/log/devutsav

echo "==> 4/8 Writing system nginx config…"
mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled
cp "${NGINX_CONF_SRC}" "${NGINX_CONF_DST}"
ln -sf "${NGINX_CONF_DST}" /etc/nginx/sites-enabled/devutsav.conf
rm -f /etc/nginx/sites-enabled/default

# If certs aren't there yet, swap to a temp HTTP-only server so nginx can boot
if [ ! -f "${LE_LIVE}" ]; then
  echo "    cert not found — installing temporary HTTP-only nginx config so we can issue one"
  cat > "${NGINX_CONF_DST}" <<EOF
server {
    listen 80 default_server;
    server_name ${DOMAIN} ${WWW_DOMAIN};
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 200 'pending'; add_header Content-Type text/plain; }
}
EOF
fi

nginx -t
systemctl enable --now nginx
systemctl reload nginx || systemctl restart nginx

if [ ! -f "${LE_LIVE}" ]; then
  echo "==> 4b Issuing Let's Encrypt cert via webroot…"
  certbot certonly --webroot -w /var/www/certbot \
    -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
    --non-interactive --agree-tos -m "admin@${DOMAIN}" || true
  if [ -f "${LE_LIVE}" ]; then
    cp "${NGINX_CONF_SRC}" "${NGINX_CONF_DST}"
    nginx -t && systemctl reload nginx
  else
    echo "    !! cert issuance failed — leaving HTTP-only config in place"
  fi
fi

echo "==> 5/8 Installing backend dependencies…"
cd "${REPO_DIR}/backend"
npm ci --omit=dev || npm install --omit=dev

echo "==> 6/8 Installing frontend dependencies + production build…"
cd "${REPO_DIR}/sattva-qwik"
npm ci || npm install
npm run build.prod

echo "==> 7/8 Starting / reloading PM2 processes…"
cd "${REPO_DIR}"
if pm2 describe devutsav-api >/dev/null 2>&1 || pm2 describe devutsav-web >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi
pm2 save

echo "==> 8/8 Enabling pm2 boot startup (idempotent)…"
pm2 startup systemd -u root --hp /root | tail -1 | sh || true
pm2 save

echo
echo "✅ VPS setup complete. Status:"
pm2 status
echo
ss -ltnp | grep -E ':(80|443|3000|5001)\b' || true
