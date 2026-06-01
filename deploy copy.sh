#!/usr/bin/expect -f

set SERVER "root@95.111.246.76"
set PASS "S1hivamp@l"
set REMOTE_DIR "/root/devutsav"

# ─── PHASE 1: RSYNC (source files only, no node_modules) ─────────────────────
puts "\n📦 Syncing source files to server (excluding node_modules)...\n"
spawn rsync -avz \
    --exclude="node_modules/" \
    --exclude=".git/" \
    --exclude="dist/" \
    --exclude="server/" \
    --exclude=".cache/" \
    --exclude="*.log" \
    --filter=":- .gitignore" \
    /Users/shivampal/Desktop/devutsav/ ${SERVER}:${REMOTE_DIR}/
expect {
    "password:" { send "${PASS}\r"; exp_continue }
    eof
}

# ─── PHASE 2: SSH — stop, rebuild, restart ───────────────────────────────────
puts "\n🔨 Connecting to server to rebuild and restart...\n"
spawn ssh -o StrictHostKeyChecking=no ${SERVER}
expect "password:"
send "${PASS}\r"
expect "#"

# Stop existing containers
send "cd ${REMOTE_DIR} && docker compose down\r"
expect "#"

# Remove old web image to force full rebuild
send "docker rmi devutsav-web devutsav-api 2>/dev/null; echo DONE_RMI\r"
expect "DONE_RMI"
expect "#"

# Build fresh - this will npm install + npm run build.prod inside Docker
send "docker compose build --no-cache 2>&1 | tee /tmp/build.log | tail -f\r"
expect -timeout 600 {
    "ERROR" {
        puts "\n❌ Build FAILED — check /tmp/build.log on server\n"
        send "tail -50 /tmp/build.log\r"
        expect "#"
        send "exit\r"
        expect eof
        exit 1
    }
    "Successfully built" {
        puts "\n✅ Images built successfully!\n"
    }
    "writing image" {
        puts "\n✅ Images built successfully!\n"
    }
    "#" {
        # build ended, check outcome
    }
}
expect "#"

# Start containers
send "docker compose up -d\r"
expect "#"

# Wait for containers to be healthy
send "sleep 6 && docker ps --format 'table {{.Names}}\t{{.Status}}'\r"
expect "#"

# Check web logs for errors
send "docker logs devutsav-web-1 --tail=25 2>&1\r"
expect "#"

send "echo '=== DONE ==='\r"
expect "=== DONE ==="
expect "#"

send "exit\r"
expect eof

puts "\n✅ Deployment complete! Site is live at https://devutsav.com\n"
