# DevUtsav — Production Server

> ⚠️ **Local-only file.** Listed in `.gitignore`. Never commit this file or `deploy.sh` — they contain plaintext credentials.

## Host

| Field        | Value                                                 |
| ------------ | ----------------------------------------------------- |
| IP           | `95.111.246.76`                                       |
| Username     | `root`                                                |
| Password     | `S1hivamp@l`                                          |
| Domain       | `https://devutsav.com` (and `www.devutsav.com`)       |
| Project root | `/root/devutsav`                                      |

```bash
ssh root@95.111.246.76
# password: S1hivamp@l
```

> **Recommended:** add an SSH key (`ssh-copy-id root@95.111.246.76`) and remove password auth. Then both `deploy.sh` and `SERVER.md` can be reduced to host-only info.

## Stack

The server runs everything via Docker Compose (`docker-compose.yml`):

| Service   | Image           | Internal port | Notes                                      |
| --------- | --------------- | ------------- | ------------------------------------------ |
| `api`     | `devutsav-api`  | `5001`        | Express backend (Node, Mongoose, Bedrock)  |
| `web`     | `devutsav-web`  | `3000`        | Qwik City SSR (Express adapter)            |
| `nginx`   | `nginx:alpine`  | `80`, `443`   | Public-facing reverse proxy (TLS via certs)|
| `certbot` | `certbot`       | —             | Auto-renews Let's Encrypt every 12h        |

Routing (`nginx/conf.d/devutsav.conf`):

- `/api/*` → `api:5001`
- everything else → `web:3000`
- HTTP → HTTPS redirect, HSTS, security headers all set

## Deploy

The fully automated flow is `deploy.sh` (an `expect` script) at the repo root. It:

1. `rsync`s the working tree to `/root/devutsav` (skips `node_modules/`, `.git/`, `dist/`, etc.)
2. SSHes in, brings the Compose stack down
3. Removes the old `devutsav-web` and `devutsav-api` images for a clean rebuild
4. `docker compose build --no-cache`
5. `docker compose up -d`
6. Tails the logs of `devutsav-web-1`

```bash
# from repo root
chmod +x deploy.sh
./deploy.sh
```

Typical run takes 5–10 minutes (mostly the Docker build).

## After-deploy checks

```bash
# from your laptop
curl -I https://devutsav.com                       # expect 200, HSTS header
curl -s https://devutsav.com/api/health            # expect {"status":"DevUtsav API is running"}
curl -s https://devutsav.com/sitemap.xml | head    # expect XML

# server-side
ssh root@95.111.246.76 'cd /root/devutsav && docker ps && docker logs devutsav-web-1 --tail=50'
```

## Environment files

`.env` files are NOT included in the rsync — they live on the server and are read at container start via `env_file:` in compose:

| Local file                  | Server file                             | Container                     |
| --------------------------- | --------------------------------------- | ----------------------------- |
| `backend/.env`              | `/root/devutsav/backend/.env`           | `devutsav-api`                |
| `sattva-qwik/.env`          | `/root/devutsav/sattva-qwik/.env`       | baked into web build          |

When you change a backend secret (e.g. `ADMIN_API_TOKEN`, `MONGO_URI`, `AWS_*`):

```bash
ssh root@95.111.246.76
cd /root/devutsav
nano backend/.env
docker compose restart api
```

When you change `sattva-qwik/.env` (`PUBLIC_API_URL`, `PUBLIC_GA_MEASUREMENT_ID`, `PUBLIC_FB_PIXEL_ID`), you must rebuild the web image — easiest is to re-run `./deploy.sh` from your laptop.

## Common one-liners

```bash
# tail web logs
ssh root@95.111.246.76 'docker logs -f devutsav-web-1'

# tail api logs
ssh root@95.111.246.76 'docker logs -f devutsav-api-1'

# restart everything (no rebuild)
ssh root@95.111.246.76 'cd /root/devutsav && docker compose restart'

# nuke + rebuild without rsync (e.g. after manual edit on server)
ssh root@95.111.246.76 'cd /root/devutsav && docker compose down && docker compose build --no-cache && docker compose up -d'

# disk usage
ssh root@95.111.246.76 'docker system df && df -h /'

# SSL renewal (manual; certbot does it automatically every 12h)
ssh root@95.111.246.76 'docker compose exec certbot certbot renew'
```
