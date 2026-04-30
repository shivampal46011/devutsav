#!/bin/sh
# Deploy current main branch to the Contabo server.
# Pulls fresh code, rebuilds containers, restarts web (triggers SSG at startup).
#
# Auth: prefers SSH keys. Falls back to sshpass + DEPLOY_PASS env var.
#   export DEPLOY_PASS='...'   # for password auth, or set up `ssh-copy-id` once.
#
# Usage:
#   ./update-server.sh                # build + restart all
#   ./update-server.sh web            # rebuild + restart web only (refreshes SSG)
#   ./update-server.sh refresh        # restart web only (re-runs SSG with current image)

set -e

SERVER="root@95.111.246.76"
REMOTE_DIR="/root/devutsav"
TARGET="${1:-all}"

if [ -n "$DEPLOY_PASS" ] && command -v sshpass >/dev/null 2>&1; then
  SSH="sshpass -p $DEPLOY_PASS ssh -o StrictHostKeyChecking=no $SERVER"
else
  SSH="ssh -o StrictHostKeyChecking=no $SERVER"
fi

echo "==> Pulling latest main on $SERVER"
$SSH "cd $REMOTE_DIR && git fetch origin main && git reset --hard origin/main"

case "$TARGET" in
  refresh)
    echo "==> Restarting web (refreshes SSG with current data)"
    $SSH "cd $REMOTE_DIR && docker compose restart web"
    ;;
  web)
    echo "==> Rebuilding & restarting web"
    $SSH "cd $REMOTE_DIR && docker compose build web && docker compose up -d web"
    ;;
  *)
    echo "==> Rebuilding all"
    $SSH "cd $REMOTE_DIR && docker compose build && docker compose up -d"
    ;;
esac

echo "==> Reloading nginx config"
$SSH "cd $REMOTE_DIR && docker compose exec -T nginx nginx -t && docker compose exec -T nginx nginx -s reload"

echo "==> Container status"
$SSH "cd $REMOTE_DIR && docker compose ps"

echo "==> Smoke test"
$SSH "curl -sI -o /dev/null -w 'GET / => %{http_code} in %{time_total}s\n' https://devutsav.com/ || true"

echo "Done."
