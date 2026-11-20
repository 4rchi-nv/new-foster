#!/bin/sh
# Online backup of the SQLite database and upload directories.
# Run as root from cron. Requires the sqlite3 package.
set -eu

stamp=$(date -u +%Y%m%dT%H%M%SZ)
dest=/var/backups/new-foster/$stamp
db=/var/lib/new-foster/database/payload.db

mkdir -p "$dest"
sqlite3 "$db" ".backup $dest/payload.db"
tar -C /var/lib/new-foster -czf "$dest/uploads.tgz" media documents inquiries
find /var/backups/new-foster -mindepth 1 -maxdepth 1 -type d -mtime +14 -exec rm -rf {} +
echo "backup $dest"
