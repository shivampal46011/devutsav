#!/bin/sh
set -e
cd /app/sattva-qwik

# Wait for the api service to become reachable, then prerender all
# static-eligible routes with live data baked in. If api never comes up,
# fall back to the dist/ already produced during the docker build (which
# was rendered without data — pages will hydrate client-side).

API_URL="${INTERNAL_API_URL:-http://api:5001}"
echo "[entrypoint] Waiting for ${API_URL} ..."

i=0
while [ $i -lt 30 ]; do
  if wget -q -O /dev/null --tries=1 --timeout=2 "${API_URL}/api/market/pujas" 2>/dev/null; then
    echo "[entrypoint] api is up — running SSG"
    if npm run build.static; then
      echo "[entrypoint] SSG complete"
    else
      echo "[entrypoint] SSG failed — serving previously built dist"
    fi
    break
  fi
  i=$((i + 1))
  sleep 2
done

if [ $i -eq 30 ]; then
  echo "[entrypoint] api never became reachable — serving baseline dist"
fi

exec node server/entry.express.js
