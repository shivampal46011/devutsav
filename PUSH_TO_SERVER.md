# 🚀 Deployment Guide: Pushing to Server

Follow these steps to deploy the Qwik City migration and backend updates to your server.

## 0. SSH connection

Use your hosting provider’s IP/hostname and a **deploy user**. Prefer **SSH keys** (`~/.ssh/config`); do **not** store passwords in this repo.

```bash
# Example (set host/user in your own notes or SSH config)
ssh deploy@your-server-host
```

## 1. Local: Commit and Push Changes

Run these commands in the root directory (`/Users/shivampal/Desktop/devutsav`):

```bash
# Add all changes
git add .

# Commit with a descriptive message
git commit -m "feat: complete migration to Qwik City with SSR"

# Push to GitHub
git push origin main
```

## 2. Server: Pull and Update
SSH into your server and run the following:

```bash
# Navigate to the project directory
cd /path/to/devutsav

# Pull the latest changes
git pull origin main

# Install new dependencies (for both backend and frontend)
npm run install:all

# Build the Qwik City frontend
cd sattva-qwik
npm run build
```

## 3. Server: Restart Services
If you are using **PM2**, restart your processes to apply the changes:

```bash
# Restart everything
pm2 restart all

# OR restart specifically if named
pm2 restart devutsav-backend
pm2 restart devutsav-frontend
```

---

> [!IMPORTANT]
> **Environment Variables**: Ensure you have updated the `.env` file in the `sattva-qwik` directory on the server with any new production keys, just as you did for the backend.
