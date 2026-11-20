# New Foster — VPS deployment

Ubuntu 24.04, Node.js 24.22.2, Nginx, systemd. One Next.js process. SQLite file on disk. No S3.

Do not copy `node_modules` or `.next` from Windows. Do not copy `.env.local`. Do not set `PAYLOAD_DROP_DATABASE`.

## How the process runs

Use `next start` after `npm ci` and `npm run build` on the VPS.

Standalone output is the wrong fit here. Payload's admin, Sharp, and the libSQL native binary are selected for the OS at install time. A standalone trace made on Windows ships the Windows Sharp and SQLite binaries. `npm ci` on Ubuntu installs `@img/sharp-linux-x64` and `@libsql/linux-x64-gnu` from `package-lock.json`.

The machine has 2 GB RAM and 2 GB swap. Build with a 1536 MB heap while the service is stopped. Run the service with a 768 MB heap.

`NEXT_PUBLIC_SITE_URL` is inlined by `next build`. Source `/etc/new-foster.env` before the build, and load the same file from systemd.

## Layout

| Path | Purpose |
| --- | --- |
| `/opt/new-foster/app` | Git checkout, `node_modules`, `.next` |
| `/var/lib/new-foster/database/payload.db` | SQLite database |
| `/var/lib/new-foster/media` | Image uploads |
| `/var/lib/new-foster/documents` | Document uploads |
| `/var/lib/new-foster/inquiries` | Old inquiry files, if any. The site does not accept new ones |
| `/etc/new-foster.env` | Secrets. Mode `600` |
| `/var/backups/new-foster` | Backups |

Local development is unchanged when `MEDIA_DIR`, `DOCUMENTS_DIR`, and `INQUIRY_DIR` are unset: `./media`, `./media/documents`, `./storage/inquiries`, and `file:./data/payload.db`.

## 1. Node.js 24.22.2

```bash
sudo apt update
sudo apt install -y ca-certificates curl xz-utils sqlite3 nginx
NODE_VERSION=24.22.2
curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" -o /tmp/node.tar.xz
sudo tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1
node -v
npm -v
```

`node -v` must print `v24.22.2`.

Confirm swap before the first build:

```bash
swapon --show
free -h
```

Expect about 2 GB of swap. Do not start the build without it.

## 2. User and directories

```bash
sudo adduser --system --group --home /opt/new-foster --shell /usr/sbin/nologin newfoster
sudo mkdir -p /opt/new-foster/app \
  /var/lib/new-foster/database \
  /var/lib/new-foster/media \
  /var/lib/new-foster/documents \
  /var/lib/new-foster/inquiries \
  /var/backups/new-foster
sudo chown -R newfoster:newfoster /opt/new-foster /var/lib/new-foster /var/backups/new-foster
sudo chmod 750 /var/lib/new-foster /var/lib/new-foster/database /var/lib/new-foster/media /var/lib/new-foster/documents /var/lib/new-foster/inquiries
```

If a production start cannot create or write these directories, the process exits with `Persistent directory is not writable: ...`.

## 3. Environment file

```bash
sudo cp /opt/new-foster/app/.env.production.example /etc/new-foster.env
sudo chown root:newfoster /etc/new-foster.env
sudo chmod 640 /etc/new-foster.env
sudoedit /etc/new-foster.env
```

Generate the secret on the server:

```bash
openssl rand -base64 48
```

Put that value in `PAYLOAD_SECRET`. It must be at least 32 characters. A production start refuses a shorter secret.

Set `NEXT_PUBLIC_SITE_URL` to the real `https` origin with no trailing slash.

Leave `DATABASE_URL`, `MEDIA_DIR`, `DOCUMENTS_DIR`, and `INQUIRY_DIR` as in the example. Do not put a Turso URL here.

`PAYLOAD_ADMIN_EMAIL` and `PAYLOAD_ADMIN_PASSWORD` create the first user only when the users collection is empty. Clear the password after the first login.

## 4. Code and Linux dependencies

```bash
sudo -u newfoster git clone <repo-url> /opt/new-foster/app
sudo -u newfoster git -C /opt/new-foster/app checkout <release-sha>
cd /opt/new-foster/app
sudo -u newfoster npm ci
```

`npm ci` installs from `package-lock.json` and builds Sharp and libSQL for Linux. Do not use `npm install` for a deploy. Do not copy `node_modules` from another machine.

## 5. Database

Payload pushes schema only when `NODE_ENV` is not `production`. Production boot does not create tables, alter them, or reset content.

Seed runs on every boot and is idempotent:

- It creates the first admin user only when there are no users and both admin env vars are set.
- It writes default site copy and catalogue rows only when there is no expertise and the site global has no company name.
- It does not replace an existing site global in production.
- It fills empty expertise steps and does not delete steps that already exist.

### Existing CMS data

Stop any process using the file, then copy the database and uploads. Copy the SQLite sidecar files if they exist (`payload.db-wal`, `payload.db-shm`).

```bash
sudo systemctl stop new-foster || true
sudo -u newfoster cp /path/to/payload.db /var/lib/new-foster/database/payload.db
sudo -u newfoster rsync -a /path/to/media/ /var/lib/new-foster/media/
sudo -u newfoster rsync -a /path/to/documents/ /var/lib/new-foster/documents/
sudo -u newfoster rsync -a /path/to/inquiries/ /var/lib/new-foster/inquiries/
```

Local documents live in `media/documents`. On the VPS they belong in `/var/lib/new-foster/documents`, not inside `media`.

A database created by `next dev` already contains the tables. Do not run migrations against it. Payload records that history as `payload_migrations.batch = -1`. An unattended `migrate` then prompts and exits. This deploy does not register `prodMigrations` for that reason.

### Empty database

Use this only when `/var/lib/new-foster/database/payload.db` does not exist. It opens a development server long enough for schema push and the first seed, then you stop it.

```bash
cd /opt/new-foster/app
sudo -u newfoster bash -lc 'set -a; source /etc/new-foster.env; set +a; NODE_ENV=development npx next dev -H 127.0.0.1 -p 3000'
```

Wait until `curl -I http://127.0.0.1:3000/ru` returns `200`, then Ctrl+C. After that, start only through systemd (`NODE_ENV=production`).

## 6. Build and service

Build with the service stopped so the heap and swap are free:

```bash
cd /opt/new-foster/app
sudo -u newfoster bash -lc 'set -a; source /etc/new-foster.env; set +a; NODE_OPTIONS=--max-old-space-size=1536 npm run build'
sudo cp /opt/new-foster/app/deploy/new-foster.service /etc/systemd/system/new-foster.service
sudo systemctl daemon-reload
sudo systemctl enable --now new-foster
sudo systemctl status new-foster --no-pager
curl -I http://127.0.0.1:3000/ru
curl -I http://127.0.0.1:3000/en
curl -I http://127.0.0.1:3000/ru/contacts
curl -I http://127.0.0.1:3000/ru/documents
curl -I http://127.0.0.1:3000/ru/privacy
```

The first production log line from SQLite should include `Enabling WAL mode`. WAL allows reads during a write. Backups must use `sqlite3 .backup`, not `cp` of the db file alone.

Logs:

```bash
sudo journalctl -u new-foster -n 100 --no-pager
```

## 7. Nginx

Replace `newfoster.example` in `deploy/nginx-new-foster.conf`, then:

```bash
sudo cp /opt/new-foster/app/deploy/nginx-new-foster.conf /etc/nginx/sites-available/new-foster
sudo ln -s /etc/nginx/sites-available/new-foster /etc/nginx/sites-enabled/new-foster
sudo nginx -t
sudo systemctl reload nginx
```

Issue a certificate when DNS already points at this server:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d newfoster.example
```

Do not change DNS as part of preparing the repository.

## 8. Later schema changes

Production will not push schema. A code change that adds or removes a Payload field does nothing to the live file until a migration is applied by hand.

When that day comes:

1. Take the backup in the next section.
2. On a copy of the database, run `npx payload migrate:create` from a development checkout and review the SQL.
3. On the VPS, with a TTY, run `npx payload migrate` only after the backup is stored off the machine.
4. If Payload says the database was pushed in dev and that migrations can lose data, stop and restore the backup. Do not confirm that prompt on the live file.

Do not add `prodMigrations` to `payload.config.ts` while `payload_migrations` contains `batch = -1`. Systemd has no TTY, and that prompt exits the service.

## 9. Backup

```bash
sudo cp /opt/new-foster/app/deploy/backup.sh /usr/local/sbin/new-foster-backup
sudo chmod 755 /usr/local/sbin/new-foster-backup
sudo mkdir -p /etc/cron.d
echo '15 3 * * * root /usr/local/sbin/new-foster-backup >> /var/log/new-foster-backup.log 2>&1' | sudo tee /etc/cron.d/new-foster-backup
sudo /usr/local/sbin/new-foster-backup
```

The script writes `/var/backups/new-foster/<UTC-stamp>/payload.db` and `uploads.tgz`, and deletes backup directories older than 14 days. Copy that directory off the VPS. A backup that exists only on the same disk is not a backup.

Run the script once by hand before every deploy and before every schema change.

## 10. Update

```bash
sudo /usr/local/sbin/new-foster-backup
cd /opt/new-foster/app
sudo systemctl stop new-foster
sudo -u newfoster git fetch --tags
sudo -u newfoster git checkout <release-sha>
sudo -u newfoster npm ci
sudo -u newfoster bash -lc 'set -a; source /etc/new-foster.env; set +a; NODE_OPTIONS=--max-old-space-size=1536 npm run build'
sudo systemctl start new-foster
curl -I http://127.0.0.1:3000/ru
```

## 11. Rollback

```bash
sudo systemctl stop new-foster
sudo -u newfoster mv /var/lib/new-foster/database/payload.db /var/lib/new-foster/database/payload.db.failed
sudo -u newfoster cp /var/backups/new-foster/<stamp>/payload.db /var/lib/new-foster/database/payload.db
sudo -u newfoster tar -C /var/lib/new-foster -xzf /var/backups/new-foster/<stamp>/uploads.tgz
cd /opt/new-foster/app
sudo -u newfoster git checkout <previous-sha>
sudo -u newfoster npm ci
sudo -u newfoster bash -lc 'set -a; source /etc/new-foster.env; set +a; NODE_OPTIONS=--max-old-space-size=1536 npm run build'
sudo systemctl start new-foster
```

Restore the database and the uploads from the same stamp. Restoring only the code against a newer database, or only the database against newer uploads, leaves broken media relations.

## 12. Smoke checks

```bash
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/ru
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/en
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/ru/contacts
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/en/contacts
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/ru/documents
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/ru/privacy
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/ru/company
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/admin
```

Public pages should be `200`. `/admin` should be `200`. There is no public inquiry form and no `POST` that stores a visitor's phone or email.

Slug checks use the file in `DATABASE_URL`, including `file:/var/lib/new-foster/database/payload.db`. A missing published slug returns 404. An unknown section returns 404. `/ru/contacts` and `/ru/privacy` are fixed pages and do not go through the slug query.
