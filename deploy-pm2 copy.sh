#!/usr/bin/expect -f

set SERVER "root@95.111.246.76"
set PASS "S1hivamp@l"
set REMOTE_DIR "/root/devutsav"

# ─── PHASE 1: RSYNC ──────────────────────────────────────────────────────────
puts "\n📦 Syncing source to server (excluding node_modules / dist / build artefacts)…\n"
spawn rsync -avz \
    --exclude=node_modules/ \
    --exclude=.git/ \
    --exclude=dist/ \
    --exclude=server/ \
    --exclude=server-ssg/ \
    --exclude=.cache/ \
    --exclude=*.log \
    /Users/shivampal/Desktop/devutsav/ ${SERVER}:${REMOTE_DIR}/
expect {
    "password:" { send "${PASS}\r"; exp_continue }
    "Number of files:" { exp_continue }
    "total size is" { exp_continue }
    eof
}
# Bail if rsync didn't actually run
catch wait result
set rc [lindex $result 3]
if {$rc != 0} {
    puts "\n❌ rsync failed (exit $rc) — aborting before SSH\n"
    exit 1
}

# ─── PHASE 2: SSH — run idempotent setup + pm2 reload ────────────────────────
puts "\n🔧 Connecting to server to run vps-setup.sh…\n"
spawn ssh -o StrictHostKeyChecking=no ${SERVER}
expect "password:"
send "${PASS}\r"
expect "#"

send "cd ${REMOTE_DIR} && bash infra/vps-setup.sh 2>&1 | tee /tmp/vps-setup.log\r"
expect -timeout 900 {
    "✅ VPS setup complete." { puts "\n✅ Setup OK\n" }
    "ERROR" {
        puts "\n❌ Setup hit an error — see /tmp/vps-setup.log on server\n"
        send "tail -60 /tmp/vps-setup.log\r"
        expect "#"
        send "exit\r"
        expect eof
        exit 1
    }
}
expect "#"

send "pm2 status\r"
expect "#"

send "echo '=== DONE ==='\r"
expect "=== DONE ==="
expect "#"

send "exit\r"
expect eof

puts "\n✅ Deployment complete! Site is live at https://devutsav.com\n"
